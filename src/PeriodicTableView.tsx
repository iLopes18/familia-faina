import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { Member } from "./types";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { handleFirestoreError, OperationType } from "./utils/firebaseErrors";

export default function PeriodicTableView() {
  const [users, setUsers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-800"></div>
      </div>
    );

  // Calculate generation for each user
  const getGeneration = (user: Member, allUsers: Member[]): number => {
    if (!user.patrao_id) return 0;
    const patrao = allUsers.find(
      (u) => u.id?.toString() === user.patrao_id?.toString(),
    );
    if (!patrao) return 0;
    return getGeneration(patrao, allUsers) + 1;
  };

  // Group by generation
  const groupedByGen = users.reduce(
    (acc, user) => {
      const gen = getGeneration(user, users);
      if (!acc[gen]) acc[gen] = [];
      acc[gen].push(user);
      return acc;
    },
    {} as Record<number, Member[]>,
  );

  const generations = Object.keys(groupedByGen)
    .map(Number)
    .sort((a, b) => a - b);

  const getInitials = (user: Member) => {
    const parts = user.nome_civil.split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return user.nome_civil.substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-full h-full overflow-auto bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-inner min-h-[600px]">
      <div className="flex flex-col gap-8">
        {generations.map((gen) => (
          <div key={gen} className="flex flex-col">
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
              <span className="bg-emerald-800 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 shadow-md">
                {gen}
              </span>
              Geração {gen}
            </h3>
            <div className="flex gap-4 flex-wrap">
              {groupedByGen[gen]
                .sort((a, b) => (a.ano_entrada || 0) - (b.ano_entrada || 0))
                .map((user, index) => {
                  const isAdopted =
                    user.tipo === "Adotado" || user.tipo === "Adotada";
                  const displayName = user.nome_praxe || user.nome_civil;
                  return (
                    <motion.div
                      key={user.id}
                      whileHover={{ scale: 1.05, y: -5 }}
                      onDoubleClick={() => navigate(`/profile/${user.id}`)}
                      className={`relative w-24 h-28 bg-white border-2 ${isAdopted ? "border-dashed border-emerald-700" : "border-emerald-700"} rounded-xl p-2 shadow-sm flex flex-col justify-between overflow-hidden group cursor-pointer select-none`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono text-slate-500">
                          {user.ano_entrada || "N/A"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {index + 1}
                        </span>
                      </div>
                      <div className="text-center flex-1 flex items-center justify-center">
                        <span className="text-2xl font-black text-slate-800 tracking-tighter">
                          {getInitials(user)}
                        </span>
                      </div>
                      <div className="text-center">
                        <span
                          className="text-[10px] font-bold text-slate-600 truncate block w-full px-1"
                          title={user.nome_civil}
                        >
                          {user.nome_civil}
                        </span>
                      </div>

                      {/* Tooltip on hover */}
                      <div className="absolute inset-0 bg-emerald-900/95 text-white p-2 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity text-xs text-center rounded-lg">
                        <span className="text-emerald-200">
                          {user.nome_praxe}
                        </span>
                        {isAdopted && (
                          <span className="text-amber-300 mt-1 text-[10px]">
                            Adotado
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        ))}
        {generations.length === 0 && (
          <div className="text-slate-500 text-center mt-20">
            Nenhum membro ativo encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
