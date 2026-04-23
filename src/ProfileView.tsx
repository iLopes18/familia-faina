import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "./firebase";
import {
  doc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Member } from "./types";
import { CheckCircle, XCircle, Trash2, Edit3, Save, X, ChevronUp, ChevronDown, User as UserIcon, Anchor, Network } from "lucide-react";
import Modal from "./components/Modal";
import { motion } from "framer-motion";
import { getCourseColors, AzelhaKnot, CoximKnot } from "./components/KnotIcons";
import AvatarRenderer from "./components/Avatar/AvatarRenderer";
import AvatarEditor from "./components/Avatar/AvatarEditor";
import { AvatarConfig } from "./types";

import { handleFirestoreError, OperationType } from "./utils/firebaseErrors";

const banners = [
  "/banner1.png",
  "/banner2.png", // Adicione os outros nomes conforme estão na pasta public
  "/banner3.png",
  "/banner4.png",
];

import { calculateMatriculaYear } from "./utils/dateUtils";

// ... existing code ...

const AvatarDecoration = ({ user }: { user: Member }) => {
  const { primary, secondary } = getCourseColors(user.curso_faina);
  const matriculaYear = user.avatar?.isFirstYear ? 1 : calculateMatriculaYear(user.ano_entrada);

  if (matriculaYear <= 1) return null;

  const isNetworkYear = matriculaYear >= 5;

  return (
    <div className={`absolute -bottom-4 -left-4 w-10 h-32 rotate-[-15deg] z-20 flex flex-col items-center rounded-lg overflow-hidden backdrop-blur-[1px] border ${
      isNetworkYear 
        ? "bg-emerald-600/10 border-emerald-600/30" 
        : "bg-black/30 border-white/10"
    }`}>
      {/* 1. Knots Area (Bottom Layer) */}
      <div className="relative z-10 flex flex-col items-center h-full w-full py-1 justify-end -space-y-1">
        {/* Ordem: Cru (Top), Castanho, Verde, Azelha (Bottom) */}
        {matriculaYear >= 4 && <img src="/coxim_cru.png" alt="Nó Cru" className="w-8 h-auto" />}
        {matriculaYear >= 3 && <img src="/coxim_castanho.png" alt="Nó Castanho" className="w-8 h-auto" />}
        {matriculaYear >= 2 && <img src="/coxim_verde.png" alt="Nó Verde" className="w-8 h-auto" />}
        {matriculaYear >= 2 && (
          <div className="mt-1 z-30 mb-1">
            <AzelhaKnot primary={primary} secondary={secondary} size={26} />
          </div>
        )}
      </div>

      {/* 2. Network Grid Background (Top Layer - Overlay) - Only for 5th year+ */}
      {matriculaYear >= 5 && (
        <div className="absolute inset-0 z-20 overflow-hidden" 
          style={{ 
            backgroundImage: `
              ${user.avatar?.hasWhiteNet ? 'linear-gradient(45deg, transparent 45%, rgba(255, 255, 255, 0.8) 50%, transparent 55%), linear-gradient(-45deg, transparent 45%, rgba(255, 255, 255, 0.8) 50%, transparent 55%),' : ''}
              linear-gradient(45deg, transparent 45%, rgba(5, 150, 105, 0.6) 50%, transparent 55%),
              linear-gradient(-45deg, transparent 45%, rgba(5, 150, 105, 0.6) 50%, transparent 55%)
            `,
            backgroundSize: '10px 10px',
            backgroundPosition: user.avatar?.hasWhiteNet ? '2px 2px, 2px 2px, 0 0, 0 0' : '0 0, 0 0',
            top: '2px',
            left: '2px',
            width: 'calc(100% - 4px)',
            height: 'calc(100% - 4px)'
          }}
        />
      )}
    </div>
  );
};

export default function ProfileView() {
  const { userData: myData, currentUser, logout } = useAuth();
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState<Member | null>(null);
  const [patrao, setPatrao] = useState<Member | null>(null);
  const [editing, setEditing] = useState(false);
  
  const [nomeCivil, setNomeCivil] = useState("");
  const [nomePraxe, setNomePraxe] = useState("");
  const [anoEntrada, setAnoEntrada] = useState<string | number>("");
  const [cursoFaina, setCursoFaina] = useState("");
  const [cursoAtual, setCursoAtual] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | undefined>(undefined);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "danger",
  });

  const isOwnProfile = !routeId || routeId === myData?.id;

  useEffect(() => {
    const fetchProfileData = async () => {
      setFetching(true);
      try {
        let user: Member | null = null;
        if (isOwnProfile) {
          user = myData;
        } else if (routeId) {
          const docRef = doc(db, "familia", routeId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            user = { ...docSnap.data(), id: docSnap.id } as Member;
          }
        }

        setProfileUser(user);
        
        if (user) {
          setNomeCivil(user.nome_civil || "");
          setNomePraxe(user.nome_praxe || "");
          setAnoEntrada(user.ano_entrada || "");
          setCursoFaina(user.curso_faina || "");
          setCursoAtual(user.curso_atual || "");
          setBannerUrl(user.bannerUrl || "");
          setAvatarConfig(user.avatar);
          
          if (user.patrao_id) {
            const patraoSnap = await getDoc(doc(db, "familia", user.patrao_id.toString()));
            if (patraoSnap.exists()) {
              setPatrao({ ...patraoSnap.data(), id: patraoSnap.id } as Member);
            }
          } else {
            setPatrao(null);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchProfileData();
  }, [routeId, myData, isOwnProfile]);

  const [pedacos, setPedacos] = useState<Member[]>([]);
  const [pedacosPendentes, setPedacosPendentes] = useState<Member[]>([]);

  useEffect(() => {
    if (!profileUser) return;

    const q = query(
      collection(db, "familia"),
      where("patrao_id", "==", profileUser.id.toString()),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allPedacos = snapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id }) as Member,
      );
      const active = allPedacos.filter((p) => p.status === "active" || !p.status);
      active.sort((a, b) => (a.order || 0) - (b.order || 0));
      setPedacos(active);
      setPedacosPendentes(allPedacos.filter((p) => p.status === "pending"));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, "familia/pedacos");
    });

    return () => unsubscribe();
  }, [profileUser]);

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-800"></div>
      </div>
    );
  }

  if (!profileUser || !currentUser) return null;

  const handleSaveProfile = async () => {
    if (!isOwnProfile || !profileUser) return;
    setLoading(true);
    setError("");
    const path = `familia/${profileUser.id}`;
    
    // Preparar dados para evitar violações de regras (ano_entrada deve ser int ou null, não string vazia)
    const normalizedAnoEntrada = anoEntrada === "" ? null : Number(anoEntrada);
    const finalNomeCivil = nomeCivil.trim() || profileUser.nome_civil || "Membro";

    try {
      await updateDoc(doc(db, "familia", profileUser.id.toString()), {
        nome_civil: finalNomeCivil,
        nome_praxe: nomePraxe || "",
        ano_entrada: (normalizedAnoEntrada !== null && !isNaN(normalizedAnoEntrada)) ? normalizedAnoEntrada : null,
        curso_faina: cursoFaina || "",
        curso_atual: cursoAtual || "",
        bannerUrl: bannerUrl || "",
        avatar: avatarConfig || profileUser.avatar || null,
      });
      setEditing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (pedacoId: string) => {
    const path = `familia/${pedacoId}`;
    try {
      await updateDoc(doc(db, "familia", pedacoId.toString()), {
        status: "active",
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleReject = async (pedacoId: string) => {
    const path = `familia/${pedacoId}`;
    try {
      await deleteDoc(doc(db, "familia", pedacoId.toString()));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const deleteMemberRecursively = async (memberId: string) => {
    try {
      // Find all children
      const q = query(
        collection(db, "familia"),
        where("patrao_id", "==", memberId),
      );
      const snapshot = await getDocs(q);

      // Delete all children recursively
      for (const childDoc of snapshot.docs) {
        await deleteMemberRecursively(childDoc.id);
      }

      // Delete the member itself
      await deleteDoc(doc(db, "familia", memberId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `familia/${memberId}`);
    }
  };

  const handleDeserdar = async (pedacoId: string) => {
    setModalConfig({
      isOpen: true,
      title: "Deserdar Pedaço",
      message: "Tem a certeza que deseja deserdar este pedaço? Esta ação é irreversível e removerá o membro e TODOS os seus descendentes da família.",
      variant: "danger",
      onConfirm: async () => {
        setLoading(true);
        try {
          await deleteMemberRecursively(pedacoId.toString());
          setModalConfig(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error(err);
          setError("Erro ao deserdar pedaço.");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleSelfExclusion = async () => {
    setModalConfig({
      isOpen: true,
      title: "Sair da Família",
      message: "Tem a certeza que deseja sair da Família de Faina? O seu perfil e TODOS os seus descendentes serão permanentemente removidos.",
      variant: "danger",
      onConfirm: async () => {
        setLoading(true);
        try {
          await deleteMemberRecursively(profileUser.id.toString());
          logout();
          navigate("/login");
        } catch (err) {
          console.error(err);
          setError("Erro ao excluir conta.");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleReorder = async (pedacoId: string, direction: 'up' | 'down') => {
    const currentIndex = pedacos.findIndex(p => p.id === pedacoId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= pedacos.length) return;

    const newPedacos = [...pedacos];
    const [movedItem] = newPedacos.splice(currentIndex, 1);
    newPedacos.splice(newIndex, 0, movedItem);

    // Update all orders in Firestore
    try {
      const updates = newPedacos.map((p, idx) => 
        updateDoc(doc(db, "familia", p.id.toString()), { order: idx })
      );
      await Promise.all(updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "familia/reorder");
    }
  };

  const displayName = profileUser.nome_praxe || profileUser.nome_civil;
  const isAdopted = profileUser.tipo === "Adotado" || profileUser.tipo === "Adotada";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Profile Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div 
          className="h-32 relative bg-emerald-900 bg-cover bg-center"
          style={{ backgroundImage: profileUser.bannerUrl ? `url(${profileUser.bannerUrl})` : 'none' }}
        >
          <div className="absolute -bottom-12 left-8">
            <div className="relative">
              {profileUser.photoUrl ? (
                <div className="relative">
                   <AvatarDecoration user={profileUser} />
                   <img
                    src={profileUser.photoUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-white object-cover bg-[#fafafa] shadow-sm relative z-10"
                  />
                </div>
              ) : (
                <div className="relative">
                  <AvatarDecoration user={profileUser} />
                  <AvatarRenderer member={profileUser} size={110} className="border-4 border-white shadow-md relative z-10" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-slate-900">
                  {displayName}
                </h1>
                {!isOwnProfile && (
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium uppercase tracking-wider">
                    Perfil Público
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-lg">{profileUser.nome_civil}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
                <span className="bg-slate-100 px-3 py-1 rounded-full flex items-center">
                  Entrada: {profileUser.ano_entrada || "N/A"}
                </span>
                {profileUser.curso_atual && (
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full flex items-center gap-1.5">
                    Curso: {profileUser.curso_atual}
                  </span>
                )}
                {isAdopted && (
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                    Adotado
                  </span>
                )}
              </div>
            </div>
            {isOwnProfile && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors font-medium border border-emerald-100"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Editar Perfil
              </button>
            )}
          </div>

          {editing && isOwnProfile && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-slate-50 p-6 rounded-2xl border border-slate-200"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Editar Informações
              </h3>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nome Civil
                  </label>
                  <input
                    type="text"
                    value={nomeCivil}
                    onChange={(e) => setNomeCivil(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nome de Faina
                  </label>
                  <input
                    type="text"
                    value={nomePraxe}
                    onChange={(e) => setNomePraxe(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ano de Entrada
                  </label>
                  <input
                    type="text"
                    value={anoEntrada}
                    onChange={(e) => setAnoEntrada(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    placeholder="Ex: 2023"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Curso de Faina
                  </label>
                  <input
                    type="text"
                    value={cursoFaina}
                    onChange={(e) => setCursoFaina(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    placeholder="Ex: Engenharia Informática"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Curso Atual (Mestrado / Mudança de curso)
                  </label>
                  <input
                    type="text"
                    value={cursoAtual}
                    onChange={(e) => setCursoAtual(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    placeholder="Ex: Mestrado em IA"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Escolher Banner
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {banners.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setBannerUrl(url)}
                        className={`h-12 rounded-lg bg-cover bg-center border-2 transition-all ${bannerUrl === url ? 'border-emerald-600 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        style={{ backgroundImage: `url(${url})` }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2 pt-4 border-t border-slate-200 mt-4">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Personalizar Avatar
                  </h3>
                  <AvatarEditor 
                    member={{...profileUser, avatar: avatarConfig}} 
                    onChange={(newConfig) => setAvatarConfig(newConfig)} 
                  />
                </div>

                <div className="md:col-span-2 pt-6 border-t border-red-100 mt-6">
                  <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
                    <h3 className="text-base font-bold text-red-800 mb-2">Zona de Perigo</h3>
                    <p className="text-red-600 text-xs mb-4">
                      Ao sair da família, o seu perfil e todos os seus descendentes serão
                      permanentemente removidos. Esta ação não pode ser desfeita.
                    </p>
                    <button
                      onClick={handleSelfExclusion}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors text-sm font-bold disabled:opacity-50"
                    >
                      Excluir Permanentemente da Família
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-emerald-800 text-white hover:bg-emerald-900 rounded-xl transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Relational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Patron Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Patrão</h2>
            <Anchor className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="p-6">
            {patrao ? (
              <Link
                to={`/profile/${patrao.id}`}
                className="flex items-center space-x-4 group p-3 rounded-2xl hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100"
              >
                {patrao.photoUrl ? (
                  <img src={patrao.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100 shadow-sm" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
                    {(patrao.nome_praxe || patrao.nome_civil).charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors capitalize">
                    {patrao.nome_praxe || patrao.nome_civil}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono tracking-tight uppercase mt-0.5">
                    {patrao.curso_atual || 'Curso N/D'}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-500 text-sm italic">Fundador da Família</p>
              </div>
            )}
          </div>
        </div>

        {/* Pedaços Ativos */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Pedaços</h2>
            <Network className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="p-6">
             {pedacos.length === 0 ? (
                <div className="text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-500 text-sm italic">Ainda não tem pedaços ativos.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pedacos.map((pedaco) => {
                    const pDisplayName = pedaco.nome_praxe || pedaco.nome_civil;
                    return (
                      <div key={pedaco.id} className="flex items-center justify-between group">
                        <Link
                          to={`/profile/${pedaco.id}`}
                          className="flex items-center space-x-3 flex-1 p-2 rounded-2xl hover:bg-emerald-50 transition-colors"
                        >
                          {pedaco.photoUrl ? (
                            <img src={pedaco.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                              {pDisplayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors text-sm">
                              {pDisplayName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">
                              {pedaco.curso_atual || 'Curso N/D'}
                            </p>
                          </div>
                        </Link>
                        {isOwnProfile && (
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex flex-col space-y-0.5">
                              <button
                                onClick={() => handleReorder(pedaco.id.toString(), 'up')}
                                disabled={pedacos.indexOf(pedaco) === 0 || loading}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-emerald-600 disabled:opacity-20 transition-colors"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleReorder(pedaco.id.toString(), 'down')}
                                disabled={pedacos.indexOf(pedaco) === pedacos.length - 1 || loading}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-emerald-600 disabled:opacity-20 transition-colors"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleDeserdar(pedaco.id.toString())}
                              disabled={loading}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Deserdar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <>
          {/* Patrão Real Dashboard Area for Requests */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-200 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Painel de Gestão</h2>
              <p className="text-sm text-slate-500 mt-1">
                Gira pedidos pendentes para se juntarem à sua família.
              </p>
            </div>

            <div className="p-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                Pedidos Pendentes
                {pedacosPendentes.length > 0 && (
                  <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                    {pedacosPendentes.length}
                  </span>
                )}
              </h3>

              {pedacosPendentes.length === 0 ? (
                <p className="text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                  Não há pedidos pendentes no momento.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pedacosPendentes.map((pedaco) => {
                    const pDisplayName = pedaco.nome_praxe || pedaco.nome_civil;
                    return (
                      <div
                        key={pedaco.id}
                        className="flex items-center justify-between p-4 border border-amber-200 bg-amber-50 rounded-2xl"
                      >
                        <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold">
                              {pDisplayName.charAt(0).toUpperCase()}
                            </div>
                          <div>
                            <p className="font-bold text-slate-800">
                              {pDisplayName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {pedaco.nome_civil}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(pedaco.id.toString())}
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors shadow-sm bg-white"
                            title="Aprovar"
                          >
                            <CheckCircle className="w-6 h-6" />
                          </button>
                          <button
                            onClick={() => handleReject(pedaco.id.toString())}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors shadow-sm bg-white"
                            title="Rejeitar"
                          >
                            <XCircle className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        loading={loading}
      />
    </div>
  );
}
