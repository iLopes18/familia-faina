import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { Anchor, Upload } from "lucide-react";
import { useAuth } from "./AuthContext";
import { Member } from "./types";
import { transferToFirebase } from "./uploaddata";

const normalizeString = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

import { handleFirestoreError, OperationType } from "./utils/firebaseErrors";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const seedFounders = async () => {
      try {
        const snapshot = await getDocs(collection(db, "familia"));
        if (snapshot.size < 5) {
          console.log("Seeding family data from uploaddata.ts (collection empty or incomplete)...");
          await transferToFirebase();
          console.log("Family data seeded successfully!");
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "familia");
      }
    };
    seedFounders();
  }, []);

  const handleUploadData = async () => {
    setUploading(true);
    try {
      await transferToFirebase();
      alert("Dados transferidos com sucesso!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "familia");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const snapshot = await getDocs(collection(db, "familia"));
      const users = snapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id } as Member)
      );

      const matchedUser = users.find((user) => {
        const normalizedInputUser = username.toLowerCase().replace(/\s+/g, "");
        const normalizedInputPass = password.toLowerCase().replace(/\s+/g, "");
        
        const nameMatch = user.nome_civil.toLowerCase().replace(/\s+/g, "") === normalizedInputUser;
        const praxeMatch = user.nome_praxe && user.nome_praxe.toLowerCase().split(/\s+/)[0] === normalizedInputPass;
        const idMatch = user.id.toString() === password;
        const nameAsPassMatch = user.nome_civil.toLowerCase().replace(/\s+/g, "") === normalizedInputPass;
        const masterMatch = password === "faina";

        return nameMatch && (praxeMatch || idMatch || nameAsPassMatch || masterMatch);
      });

      if (matchedUser) {
        login(matchedUser.id.toString());
        navigate("/");
      } else {
        setError(
          "Credenciais inválidas. Tente o seu nome civil como username e password (ou a primeira palavra do nome de praxe)."
        );
      }
    } catch (err: any) {
      handleFirestoreError(err, OperationType.GET, "familia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-emerald-800 rounded-full flex items-center justify-center shadow-lg">
            <Anchor className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Família de Faina
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Entrar na hierarquia
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Username
              </label>
              <p className="text-xs text-slate-500 mb-1">Formato: primeironomeultimonome (ex: isaaclopes)</p>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <p className="text-xs text-slate-500 mb-1">Formato: primeironomefaina (ex: mcqueen)</p>
              <div className="mt-1">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-800 hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
              >
                {loading ? "A entrar..." : "Entrar"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">
                  Novo pedaço?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full flex justify-center py-2.5 px-4 border border-slate-300 rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                Registar na Família
              </Link>
            </div>
            
            <div className="mt-4">
              <button
                onClick={handleUploadData}
                disabled={uploading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-emerald-300 rounded-xl shadow-sm text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "A transferir..." : "Importar Dados (uploaddata.ts)"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
