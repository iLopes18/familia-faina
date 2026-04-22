import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  LogOut,
  Network,
  Grid3X3,
  User as UserIcon,
  Anchor,
} from "lucide-react";
import TreeView from "./TreeView";
import PeriodicTableView from "./PeriodicTableView";
import ProfileView from "./ProfileView";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<"tree" | "table" | "profile">(
    id ? "profile" : "tree",
  );

  useEffect(() => {
    if (id) {
      setActiveTab("profile");
    }
  }, [id]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!userData) return null;

  if (userData.status === "pending") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
          <div className="mx-auto h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <Anchor className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Pedido Pendente
          </h2>
          <p className="text-slate-600 mb-8">
            O seu pedido para se juntar à Família de Faina está a aguardar
            aprovação do seu Patrão.
          </p>
          <button
            onClick={handleLogout}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-slate-300 rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Anchor className="h-8 w-8 text-emerald-400 mr-3" />
              <span className="font-bold text-xl tracking-tight">
                Família de Faina
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-emerald-100 text-sm hidden sm:block">
                Olá, {userData.nome_praxe || userData.nome_civil}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-emerald-800 transition-colors text-emerald-100 hover:text-white"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("tree")}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "tree"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Network className="w-4 h-4 mr-2" />
              Árvore
            </button>
            <button
              onClick={() => setActiveTab("table")}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "table"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Tabela Periódica
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "profile"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Perfil & Gestão
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full mx-auto p-2 sm:p-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === "tree" && <TreeView />}
            {activeTab === "table" && <PeriodicTableView />}
            {activeTab === "profile" && <ProfileView />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
