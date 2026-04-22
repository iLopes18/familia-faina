import React, { useState, useEffect } from "react";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import { Anchor } from "lucide-react";
import { Member } from "./types";
import { useAuth } from "./AuthContext";

import { handleFirestoreError, OperationType } from "./utils/firebaseErrors";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fainaName, setFainaName] = useState("");
  const [entryYear, setEntryYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [cursoFaina, setCursoFaina] = useState("");
  const [patraoId, setPatraoId] = useState("");
  const [isAdopted, setIsAdopted] = useState(false);

  const [patroes, setPatroes] = useState<Member[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const fetchPatroes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "familia"));
        const usersData = querySnapshot.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id }) as Member,
        );
        setPatroes(usersData);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "familia");
      }
    };
    fetchPatroes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!patraoId) {
      setError("Por favor, selecione o seu Patrão.");
      setLoading(false);
      return;
    }

    try {
      const newMemberRef = doc(collection(db, "familia"));
      const newId = newMemberRef.id;

      const siblings = patroes.filter(p => p.patrao_id?.toString() === patraoId.toString());
      const maxOrder = siblings.reduce((max, s) => Math.max(max, s.order || 0), -1);

      const newMember: any = {
        id: newId,
        uid: newId,
        nome_civil: `${firstName.trim()} ${lastName.trim()}`.trim(),
        nome_praxe: fainaName.trim(),
        ano_entrada: parseInt(entryYear, 10),
        curso_faina: cursoFaina.trim(),
        patrao_id: patraoId,
        status: "pending",
        tipo: isAdopted ? "Adotado" : "Natural",
        order: maxOrder + 1,
      };

      await setDoc(newMemberRef, newMember);
      login(newId);
      navigate("/");
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, "familia");
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
          Novo Pedaço
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Juntar-se à Família de Faina
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Primeiro Nome
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Apelido
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Opcional"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Nome de Faina (Password)
              </label>
              <input
                type="text"
                value={fainaName}
                onChange={(e) => setFainaName(e.target.value)}
                placeholder="Opcional"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Ano de Entrada
                </label>
                <input
                  type="number"
                  required
                  min="1900"
                  max="2100"
                  value={entryYear}
                  onChange={(e) => setEntryYear(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Curso de Faina
              </label>
              <input
                type="text"
                required
                value={cursoFaina}
                onChange={(e) => setCursoFaina(e.target.value)}
                placeholder="Ex: Engenharia Informática"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Patrão
              </label>
              <select
                value={patraoId}
                required
                onChange={(e) => setPatraoId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-xl shadow-sm"
              >
                <option value="" disabled>Selecione o seu Patrão</option>
                {patroes
                  .filter((p) => p.status === "active" || !p.status)
                  .map((patrao) => (
                    <option key={patrao.id} value={patrao.id}>
                      {patrao.nome_praxe || patrao.nome_civil}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="isAdopted"
                name="isAdopted"
                type="checkbox"
                checked={isAdopted}
                onChange={(e) => setIsAdopted(e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
              />
              <label
                htmlFor="isAdopted"
                className="ml-2 block text-sm text-slate-900"
              >
                Sou um membro adotado
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-800 hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
              >
                {loading ? "A registar..." : "Submeter Pedido"}
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
                  Já tem um Patrão?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2.5 px-4 border border-slate-300 rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                Voltar ao Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
