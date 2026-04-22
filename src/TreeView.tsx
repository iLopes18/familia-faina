import React, { useEffect, useState, useRef } from "react";
import { collection, onSnapshot, query, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Member } from "./types";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Edit2, Check, X } from "lucide-react";
import { getCourseColors, AzelhaKnot, CoximKnot } from "./components/KnotIcons";
import AvatarRenderer from "./components/Avatar/AvatarRenderer";
import { calculateMatriculaYear } from "./utils/dateUtils";

const getDescendantCount = (userId: string | number, allUsers: Member[]): number => {
  const children = allUsers.filter(u => u.patrao_id?.toString().trim() === userId.toString().trim());
  return children.length + children.reduce((acc, c) => acc + getDescendantCount(c.id as string, allUsers), 0);
};

const getSubtreeWidth = (userId: string | number, allUsers: Member[]): number => {
  const children = allUsers.filter(u => u.patrao_id?.toString().trim() === userId.toString().trim());
  if (children.length === 0) return 1;
  return Math.max(1, children.reduce((acc, c) => acc + getSubtreeWidth(c.id as string, allUsers), 0));
};

import { handleFirestoreError, OperationType } from "./utils/firebaseErrors";

const TreeNode: React.FC<{ 
  user: Member; 
  allUsers: Member[]; 
  branchExtension?: number; 
  shiftX?: number;
  isEditing: boolean;
}> = ({
  user,
  allUsers,
  branchExtension = 0,
  shiftX = 0,
  isEditing
}) => {
  const [expanded, setExpanded] = useState(true);

  const children = allUsers
    .filter((u) => u.patrao_id?.toString().trim() === user.id?.toString().trim())
    .sort((a, b) => {
      // First sort by order if available
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;

      // Fallback to ID
      const idA = parseInt(a.id as string) || 0;
      const idB = parseInt(b.id as string) || 0;
      return idA - idB;
    });

  const hasChildren = children.length > 0;
  const isAdopted = user.tipo === "Adotado" || user.tipo === "Adotada";
  const displayName = user.nome_praxe || user.nome_civil;

  const handleUpdateLayout = async (updates: Partial<Member>) => {
    const path = `familia/${user.id}`;
    try {
      await updateDoc(doc(db, "familia", user.id.toString()), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  // Use manual values if they exist, otherwise use automatic ones
  const finalShiftX = user.manualShiftX !== undefined ? user.manualShiftX * 90 : shiftX;
  const finalExtension = user.manualExtension !== undefined ? user.manualExtension : branchExtension;

  // Calculate branch extensions and dogleg shifts for children
  const childrenWithCounts = children.map((c, index) => ({
    child: c,
    index,
    count: getDescendantCount(c.id as string, allUsers),
    width: getSubtreeWidth(c.id as string, allUsers),
    hasChildren: allUsers.some(u => u.patrao_id?.toString().trim() === c.id?.toString().trim())
  }));
  
  // Re-calculating automatic layouts for children if they don't have manual ones
  const childLayouts = new Map<string, { extension: number, shiftSlots: number }>();
  
  // Automatic layout logic (simplified for brevity but keeping the spirit)
  const childrenWithDescendants = children.filter(c => allUsers.some(u => u.patrao_id?.toString().trim() === c.id?.toString().trim()));
  const sortedForShift = [...childrenWithDescendants].sort((a, b) => getDescendantCount(b.id as string, allUsers) - getDescendantCount(a.id as string, allUsers));
  const placedForShift: { left: number, right: number }[] = [];
  
  sortedForShift.forEach(c => {
    const cWidth = getSubtreeWidth(c.id as string, allUsers);
    const cIndex = children.indexOf(c);
    let bestShift = 0;
    let found = false;
    for (let shift of [0, -1, 1, -2, 2, -3, 3, -4, 4]) {
      const center = cIndex + shift;
      const left = center - cWidth / 2;
      const right = center + cWidth / 2;
      const collides = placedForShift.some(p => left < p.right + 0.2 && right > p.left - 0.2);
      if (!collides) {
        bestShift = shift;
        found = true;
        placedForShift.push({ left, right });
        break;
      }
    }
    childLayouts.set(c.id as string, { extension: 0, shiftSlots: bestShift });
  });

  const sortedForExt = [...childrenWithDescendants].sort((a, b) => getDescendantCount(a.id as string, allUsers) - getDescendantCount(b.id as string, allUsers));
  const levels: { left: number, right: number }[][] = [];
  sortedForExt.forEach(c => {
    const layout = childLayouts.get(c.id as string)!;
    const cWidth = getSubtreeWidth(c.id as string, allUsers);
    const cIndex = children.indexOf(c);
    const center = cIndex + layout.shiftSlots;
    const left = center - cWidth / 2;
    const right = center + cWidth / 2;
    let assignedLevel = 0;
    while (true) {
      if (!levels[assignedLevel]) levels[assignedLevel] = [];
      const collides = levels[assignedLevel].some(p => left < p.right + 0.2 && right > p.left - 0.2);
      if (!collides) {
        levels[assignedLevel].push({ left, right });
        break;
      }
      assignedLevel++;
    }
    layout.extension = assignedLevel * 140;
  });

  return (
    <div className={`flex flex-col items-center relative w-max transition-all ${isEditing ? 'hover:z-[100]' : ''}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="z-10 flex flex-col items-center cursor-pointer relative w-[90px]"
        onClick={() => !isEditing && setExpanded(!expanded)}
      >
        <div className="relative">
          <div className="absolute -bottom-1 -left-1 scale-[0.35] origin-bottom-right z-20 pointer-events-none">
            {(() => {
              const matriculaYear = user.avatar?.isFirstYear ? 1 : calculateMatriculaYear(user.ano_entrada);
              if (matriculaYear <= 1) return null;
              const { primary, secondary } = getCourseColors(user.curso_faina);

              return (
                <div className={`absolute -bottom-1 -left-1 w-10 h-28 rounded-lg rotate-[-15deg] z-20 flex flex-col items-center overflow-hidden border backdrop-blur-[1px] ${
                  matriculaYear >= 5 
                    ? "bg-emerald-600/10 border-emerald-600/20" 
                    : "bg-black/30 border-white/10"
                }`}>
                  <div className="relative z-10 flex flex-col items-center h-full w-full py-1 justify-end -space-y-1">
                    {/* Ordem: Cru (Top), Castanho, Verde, Azelha (Bottom) */}
                    {matriculaYear >= 4 && <img src="/coxim_cru.png" alt="Nó Cru" className="w-[28px] h-auto" />}
                    {matriculaYear >= 3 && <img src="/coxim_castanho.png" alt="Nó Castanho" className="w-[28px] h-auto" />}
                    {matriculaYear >= 2 && <img src="/coxim_verde.png" alt="Nó Verde" className="w-[28px] h-auto" />}
                    {matriculaYear >= 2 && (
                      <div className="mt-1 z-30 mb-1">
                        <AzelhaKnot primary={primary} secondary={secondary} size={24} />
                      </div>
                    )}
                  </div>

                  {/* 2. Network Grid Background (Top Layer - Overlay) */}
                  {matriculaYear >= 5 && (
                    <div className="absolute inset-0 z-20" 
                      style={{ 
                        backgroundImage: `
                          ${user.avatar?.hasWhiteNet ? 'linear-gradient(45deg, transparent 45%, rgba(255, 255, 255, 0.8) 50%, transparent 55%), linear-gradient(-45deg, transparent 45%, rgba(255, 255, 255, 0.8) 50%, transparent 55%),' : ''}
                          linear-gradient(45deg, transparent 45%, rgba(5, 150, 105, 0.6) 50%, transparent 55%),
                          linear-gradient(-45deg, transparent 45%, rgba(5, 150, 105, 0.6) 50%, transparent 55%)
                        `,
                        backgroundSize: '8px 8px',
                        backgroundPosition: user.avatar?.hasWhiteNet ? '2px 2px, 2px 2px, 0 0, 0 0' : '0 0, 0 0',
                        top: '1px',
                        left: '1px',
                        width: 'calc(100% - 2px)',
                        height: 'calc(100% - 2px)'
                      }}
                    />
                  )}
                </div>
              );
            })()}
          </div>
          
        {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover border-2 shadow-sm bg-[#fafafa] flex-shrink-0 border-emerald-600 relative z-10"
            />
          ) : (
            <AvatarRenderer member={user} size={50} className="border-2 border-emerald-600 shadow-sm relative z-10" />
          )}
        </div>
        
        <div className="mt-1 px-1.5 py-0.5 rounded-full shadow-sm border text-center min-w-[70px] max-w-[90px] bg-[#eefcf2] border-[#a3d2a6]">
          <span className="font-bold text-slate-800 text-[9px] leading-tight line-clamp-1 break-words">
            {user.nome_civil}
          </span>
          {user.nome_praxe && (
            <span className="text-[7px] text-slate-600 leading-tight line-clamp-2 italic mt-0.5 break-words">
              {user.nome_praxe}
            </span>
          )}
        </div>
        
        {hasChildren && !isEditing && (
          <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 bg-white border border-slate-300 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] text-slate-600 shadow-sm hover:bg-slate-100 transition-colors">
            {expanded ? "-" : "+"}
          </div>
        )}

        {/* Manual Edit Controls */}
        {isEditing && hasChildren && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-row gap-1 bg-white/90 backdrop-blur-sm p-1.5 rounded-xl shadow-lg border border-slate-200 z-50 whitespace-nowrap">
            <button 
              onClick={(e) => { e.stopPropagation(); handleUpdateLayout({ manualShiftX: (user.manualShiftX || 0) - 1 }); }}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 border border-slate-100" title="Shift Left"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleUpdateLayout({ manualShiftX: (user.manualShiftX || 0) + 1 }); }}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 border border-slate-100" title="Shift Right"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleUpdateLayout({ manualExtension: (user.manualExtension || 0) - 20 }); }}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 border border-slate-100" title="Shorten Line"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleUpdateLayout({ manualExtension: (user.manualExtension || 0) + 20 }); }}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 border border-slate-100" title="Lengthen Line"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-0.5 self-center" />
            <button 
              onClick={(e) => { e.stopPropagation(); handleUpdateLayout({ manualShiftX: 0, manualExtension: 0 }); }}
              className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 border border-red-100" title="Reset"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>

      {expanded && hasChildren && (
        <div className="flex flex-col items-center w-max">
          {/* Vertical line from parent down to the bus level. 
              Includes dogleg shift if finalShiftX !== 0 */}
          {finalShiftX !== 0 ? (
            <div className="relative z-0 -mt-1" style={{ height: `${30 + finalExtension}px`, width: '2px' }}>
               <div className="absolute top-0 border-l-2 border-slate-300" style={{ height: `${15 + finalExtension}px`, left: '0px' }}></div>
               <div className="absolute border-t-2 border-slate-300" style={{ top: `${15 + finalExtension}px`, width: `${Math.abs(finalShiftX)}px`, left: finalShiftX > 0 ? '0px' : `${-finalShiftX}px` }}></div>
               <div className="absolute border-l-2 border-slate-300" style={{ top: `${15 + finalExtension}px`, height: '15px', left: `${finalShiftX}px` }}></div>
            </div>
          ) : (
            <div 
              className="border-l-2 border-solid border-slate-300 -mt-1 z-0" 
              style={{ height: `${30 + finalExtension}px` }}
            ></div>
          )}

          <div className="flex justify-center relative w-max" style={{ transform: `translateX(${finalShiftX}px)` }}>
            {children.map((child, index) => {
              const isFirst = index === 0;
              const isLast = index === children.length - 1;
              const isOnly = children.length === 1;
              const childIsAdopted = child.tipo === "Adotado" || child.tipo === "Adotada";
              const isEven = index % 2 === 0;
              const zigZagOffset = isOnly ? 0 : (isEven ? 0 : 45);
              const layout = childLayouts.get(child.id as string) || { extension: 0, shiftSlots: 0 };

              return (
                <div key={child.id} className="relative flex flex-col items-center w-[90px] shrink-0">
                  {!isOnly && (
                    <div 
                      className="absolute top-0 border-t-2 border-solid border-slate-300"
                      style={{
                        left: isFirst ? '50%' : '0',
                        width: isFirst || isLast ? '50%' : '100%',
                      }}
                    />
                  )}
                  <div 
                    className={`absolute top-0 left-1/2 -translate-x-1/2 ${childIsAdopted ? 'border-l-2 border-dashed border-slate-300' : 'border-l-2 border-solid border-slate-300'}`}
                    style={{ height: `${20 + zigZagOffset}px` }}
                  />
                  <div style={{ marginTop: `${20 + zigZagOffset}px` }} className="flex flex-col items-center w-max">
                    <TreeNode 
                      user={child} 
                      allUsers={allUsers} 
                      branchExtension={layout.extension} 
                      shiftX={layout.shiftSlots} 
                      isEditing={isEditing}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default function TreeView() {
  const [users, setUsers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const path = "familia";
    const q = query(collection(db, "familia"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id }) as Member,
      );
      setUsers(usersData.filter((u) => u.status === "active" || !u.status));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, []);

  const fitToScreen = () => {
    if (containerRef.current && treeRef.current) {
      const containerWidth = containerRef.current.clientWidth - 80;
      const containerHeight = containerRef.current.clientHeight - 80;
      const treeWidth = treeRef.current.scrollWidth;
      const treeHeight = treeRef.current.scrollHeight;
      
      if (treeWidth > 0 && treeHeight > 0) {
        const scaleX = containerWidth / treeWidth;
        const scaleY = containerHeight / treeHeight;
        const newScale = Math.min(1, scaleX, scaleY);
        setScale(newScale);
        
        // Center after scale
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollLeft = (containerRef.current.scrollWidth - containerRef.current.clientWidth) / 2;
            containerRef.current.scrollTop = 0;
          }
        }, 100);
      }
    }
  };

  useEffect(() => {
    if (users.length > 0 && !isEditing) {
      const timer = setTimeout(fitToScreen, 100);
      return () => clearTimeout(timer);
    }
  }, [users, isEditing]);

  useEffect(() => {
    if (containerRef.current && users.length > 0 && !isEditing) {
      const timer = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollLeft = (containerRef.current.scrollWidth - containerRef.current.clientWidth) / 2;
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [users, isEditing]);

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-800"></div>
      </div>
    );

  const userIds = new Set(users.map((u) => u.id?.toString()));
  const founders = users
    .filter((u) => !u.patrao_id || !userIds.has(u.patrao_id.toString()))
    .sort((a, b) => {
      // First sort by order if available
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;

      const idA = parseInt(a.id as string) || 0;
      const idB = parseInt(b.id as string) || 0;
      return idA - idB;
    });

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-auto bg-slate-50 relative rounded-xl border border-slate-200 shadow-inner min-h-[600px]"
    >
      {/* Zoom & Edit Controls */}
      <div className="sticky top-4 left-4 w-fit flex gap-2 z-30 bg-white/90 backdrop-blur-sm p-1.5 rounded-xl shadow-md border border-slate-200 mb-4 ml-4">
        <button 
          onClick={() => setScale(s => Math.min(s * 1.2, 3))} 
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-700"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setScale(s => Math.max(s / 1.2, 0.1))} 
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-700"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button 
          onClick={fitToScreen} 
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-700"
          title="Fit to Screen"
        >
          <Maximize className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 px-3 ${isEditing ? 'bg-emerald-800 text-white' : 'hover:bg-slate-100 text-slate-700'}`}
          title={isEditing ? "Finish Editing" : "Manual Edit Layout"}
        >
          {isEditing ? <Check className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
          <span className="text-sm font-medium">{isEditing ? "Concluir" : "Editar Layout"}</span>
        </button>
      </div>

      <div 
        className="w-full flex origin-top transition-transform duration-300 ease-out min-w-max px-[1000px] pb-[1000px] pt-24"
        style={{ transform: `scale(${scale})` }}
      >
        <div ref={treeRef} className="flex justify-center gap-16">
          {founders.map((founder) => (
            <TreeNode key={founder.id} user={founder} allUsers={users} isEditing={isEditing} />
          ))}
          {founders.length === 0 && (
            <div className="text-slate-500 text-center mt-20">
              Nenhum membro ativo encontrado na árvore.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
