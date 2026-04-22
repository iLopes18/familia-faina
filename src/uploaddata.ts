import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

const familyData = [
  {
    "id": 1,
    "nome_civil": "Silvana",
    "nome_praxe": "",
    "ano_entrada": null,
    "patrao_id": null
  },
  {
    "id": 2,
    "nome_civil": "André Oliveira",
    "nome_praxe": "Lobo Mau Baldio Primeira Bolacha",
    "ano_entrada": 2016,
    "patrao_id": 1
  },
  {
    "id": 3,
    "nome_civil": "Sofia Jesus",
    "nome_praxe": "Siggy Sapateira Baldia Daniels Má",
    "ano_entrada": null,
    "patrao_id": 2
  },
  {
    "id": 4,
    "nome_civil": "Filipa Pinto",
    "nome_praxe": "Freja Desaparecida Baldia Daniels Má",
    "ano_entrada": null,
    "patrao_id": 2
  },
  {
    "id": 5,
    "nome_civil": "Bruno Duarte",
    "nome_praxe": "Bjorn Narigudo Baldio Daniels Mau",
    "ano_entrada": null,
    "patrao_id": 2
  },
  {
    "id": 6,
    "nome_civil": "Sara Pereira",
    "nome_praxe": "Pipoca Salgada do Berço",
    "ano_entrada": null,
    "patrao_id": 2,
    "tipo": "Adotada"
  },
  {
    "id": 7,
    "nome_civil": "Beatriz Moleiro",
    "nome_praxe": "Berghild Lobo Mau Baldia Daniels Má",
    "ano_entrada": null,
    "patrao_id": 2
  },
  {
    "id": 8,
    "nome_civil": "Orlando Silva",
    "nome_praxe": "Osmond Ícaro Pachacutti Baldio Daniels Mau",
    "ano_entrada": null,
    "patrao_id": 2
  },
  {
    "id": 9,
    "nome_civil": "Daniel Perestrelo",
    "nome_praxe": "Dagfinn Peri Piri Pseudo Baldio Daniels Mau",
    "ano_entrada": null,
    "patrao_id": 2,
    "tipo": "Adotado"
  },
  {
    "id": 10,
    "nome_civil": "Carolina Jorge",
    "nome_praxe": "Lagertha Prinzessin des Flusses Baldia Daniels Má",
    "ano_entrada": null,
    "patrao_id": 2
  },
  {
    "id": 11,
    "nome_civil": "Inês Carrapato",
    "nome_praxe": "Ingrid Victoria de Merola Baldia Daniels Má",
    "ano_entrada": null,
    "patrao_id": 2
  },
  {
    "id": 12,
    "nome_civil": "Gustavo",
    "nome_praxe": "Georg Den Sista Feto La Bumba Baldio Daniels Mau",
    "ano_entrada": null,
    "patrao_id": 2
  },
  {
    "id": 13,
    "nome_civil": "Daniela Branco",
    "nome_praxe": "Puppy Icecream",
    "ano_entrada": null,
    "patrao_id": 2,
    "tipo": "Adotada"
  },
  {
    "id": 14,
    "nome_civil": "Jéssica",
    "nome_praxe": "Jorlaug Blue French Horn",
    "ano_entrada": null,
    "patrao_id": 3
  },
  {
    "id": 15,
    "nome_civil": "Renato Vala",
    "nome_praxe": "Ragnar Bacon Baldio Daniel's Mau Flor",
    "ano_entrada": null,
    "patrao_id": 5
  },
  {
    "id": 16,
    "nome_civil": "Raquel Fernandes",
    "nome_praxe": "Ragnild Oregãos Baldia Daniel's Má Bruxelas",
    "ano_entrada": null,
    "patrao_id": 5
  },
  {
    "id": 17,
    "nome_civil": "Carina Caires",
    "nome_praxe": "Cadence Queijo Baldia Daniel's Má Portuguesa",
    "ano_entrada": null,
    "patrao_id": 5
  },
  {
    "id": 18,
    "nome_civil": "Maria João Lapo",
    "nome_praxe": "",
    "ano_entrada": null,
    "patrao_id": 5,
    "tipo": "Adotada"
  },
  {
    "id": 19,
    "nome_civil": "Marco Prazeres",
    "nome_praxe": "Mimir Raphael Baldio Daniel's Mau 21 e Meio (Mimir the Sage)",
    "ano_entrada": null,
    "patrao_id": 5
  },
  {
    "id": 20,
    "nome_civil": "Carolina Cabral",
    "nome_praxe": "Karen Donatello Baldia Daniel's Má 21 e Meio (Karen the Pure)",
    "ano_entrada": null,
    "patrao_id": 5
  },
  {
    "id": 21,
    "nome_civil": "Joana Passos",
    "nome_praxe": "Jord Michaelangelo Baldia Daniel's Má 21 e Meio (Jord the Night Children)",
    "ano_entrada": null,
    "patrao_id": 5
  },
  {
    "id": 22,
    "nome_civil": "Baniel Espínola",
    "nome_praxe": "Dagmar Leonardo Baldia Daniel's Mau 21 e Meio (Dagmar the Dayglory)",
    "ano_entrada": null,
    "patrao_id": 5
  },
  {
    "id": 23,
    "nome_civil": "Ana Peixoto",
    "nome_praxe": "Astgrid the Fighter Baldia Daniel's Má 21 e Meio",
    "ano_entrada": null,
    "patrao_id": 5
  },
  {
    "id": 24,
    "nome_civil": "Maria Rita",
    "nome_praxe": "Millay the Flower Daniel's Má 21 e Meio",
    "ano_entrada": null,
    "patrao_id": 5
  },
  {
    "id": 25,
    "nome_civil": "Ana Caiado",
    "nome_praxe": "Amora the Light Eagle Baldia Daniel's Má 21 e Meio",
    "ano_entrada": null,
    "patrao_id": 5
  },
  {
    "id": 26,
    "nome_civil": "Francisco",
    "nome_praxe": "Frode the Wise Daniel's Mau 21 e Meio",
    "ano_entrada": null,
    "patrao_id": 5
  },
  {
    "id": 27,
    "nome_civil": "Maria Alves",
    "nome_praxe": "Mans the Great Daniel's Má 21 e Meio",
    "ano_entrada": null,
    "patrao_id": 5
  },
  {
    "id": 28,
    "nome_civil": "Maria Forte",
    "nome_praxe": "Marith the Defiant Baldia Daniel's Má 21 e Meio",
    "ano_entrada": null,
    "patrao_id": 5
  },
  {
    "id": 29,
    "nome_civil": "Nicole Moniz",
    "nome_praxe": "Norberta the Northern Light Baldia Daniel's Má 21 e Meio",
    "ano_entrada": null,
    "patrao_id": 5
  },
  {
    "id": 30,
    "nome_civil": "Carolina Neri",
    "nome_praxe": "Cervesiam Agrobeta Nelis Salgada",
    "ano_entrada": null,
    "patrao_id": 6
  },
  {
    "id": 31,
    "nome_civil": "Liliana Vicente",
    "nome_praxe": "Lalileu Ovium Triunfo de Viena Salgada",
    "ano_entrada": null,
    "patrao_id": 6
  },
  {
    "id": 32,
    "nome_civil": "Maria Madaleno",
    "nome_praxe": "Mel Vita-Festum Maretinni Salgada",
    "ano_entrada": null,
    "patrao_id": 6
  },
  {
    "id": 33,
    "nome_civil": "Sara Ferreira",
    "nome_praxe": "Zappa de canteiro bubblewaffle",
    "ano_entrada": null,
    "patrao_id": 13
  },
  {
    "id": 34,
    "nome_civil": "Filipa Valente",
    "nome_praxe": "Aaaaaaaaaahhh sushi decanteiro trasadinho",
    "ano_entrada": null,
    "patrao_id": 13
  },
  {
    "id": 35,
    "nome_civil": "Bruno Fernandes",
    "nome_praxe": "Larry de canteiro tostazita (misteira)",
    "ano_entrada": null,
    "patrao_id": 13
  },
  {
    "id": 36,
    "nome_civil": "Mafalda Matias",
    "nome_praxe": "Kira de canteiro cookie (chocolateira)",
    "ano_entrada": null,
    "patrao_id": 13
  },
  {
    "id": 37,
    "nome_civil": "Leandro",
    "nome_praxe": "Duke de canteiro cimbalino",
    "ano_entrada": null,
    "patrao_id": 13
  },
  {
    "id": 38,
    "nome_civil": "Salomé Martins",
    "nome_praxe": "Solvig Bicha do Demónio Daniels Mau Magic Bagaceira",
    "ano_entrada": null,
    "patrao_id": 15
  },
  {
    "id": 39,
    "nome_civil": "Daniel Melo",
    "nome_praxe": "D'agar Chasco Preto Daniels Mau Magic Bagaceira",
    "ano_entrada": null,
    "patrao_id": 15
  },
  {
    "id": 40,
    "nome_civil": "Mafalda Cruz",
    "nome_praxe": "Magnild Stitch Osmio Daniels Mau Magic Bagaceira",
    "ano_entrada": null,
    "patrao_id": 15
  },
  {
    "id": 41,
    "nome_civil": "Marta Rendeiro",
    "nome_praxe": "Mildri Luisa Nove e Três Quartos Daniels Mau Magic Bagaceira",
    "ano_entrada": null,
    "patrao_id": 15
  },
  {
    "id": 42,
    "nome_civil": "Íris Balseiro",
    "nome_praxe": "Ingrid Teresa Nove e Três Quartos Daniels Mau Magic Bagaceira",
    "ano_entrada": null,
    "patrao_id": 15
  },
  {
    "id": 43,
    "nome_civil": "Lucas Matias",
    "nome_praxe": "Leif Sarça Ardente Daniels Mau Magic Bagaceira",
    "ano_entrada": null,
    "patrao_id": 15
  },
  {
    "id": 44,
    "nome_civil": "António Souto",
    "nome_praxe": "Arne Jebediah Gagarin Daniels Má Magic Bagaceira",
    "ano_entrada": null,
    "patrao_id": 15
  },
  {
    "id": 45,
    "nome_civil": "Joana Figueiredo",
    "nome_praxe": "Jordis Asereje McNuggie Daniels Má Magic Bagaceira",
    "ano_entrada": null,
    "patrao_id": 15
  },
  {
    "id": 46,
    "nome_civil": "Tiago Almeida",
    "nome_praxe": "Thorin Group B McNuggie Daniels Mau Magic Bagaceira",
    "ano_entrada": null,
    "patrao_id": 15
  },
  {
    "id": 47,
    "nome_civil": "Vera Kucheryavenko",
    "nome_praxe": "Vigdis Cookie Masterchef Daniels Má Magic Bagaceira",
    "ano_entrada": null,
    "patrao_id": 15
  },
  {
    "id": 48,
    "nome_civil": "Samuel Amorim",
    "nome_praxe": "Skalbjorn Ayrton Perneta Daniels Mau Magic Bagaceira",
    "ano_entrada": null,
    "patrao_id": 15
  },
  {
    "id": 49,
    "nome_civil": "Diogo Silva",
    "nome_praxe": "Dvalinn Mufi Manaça Daniels Má Magic Bagaceira",
    "ano_entrada": null,
    "patrao_id": 15
  },
  {
    "id": 50,
    "nome_civil": "Miguel Vieira",
    "nome_praxe": "M'Baku Malfoy Bimba y Lola",
    "ano_entrada": null,
    "patrao_id": 30
  },
  {
    "id": 51,
    "nome_civil": "Tiago Parracho",
    "nome_praxe": "Thor Longbottom Bimba y Lola",
    "ano_entrada": null,
    "patrao_id": 30
  },
  {
    "id": 52,
    "nome_civil": "Joana Pereira",
    "nome_praxe": "Jean Grey Granger Bimba y Lola",
    "ano_entrada": null,
    "patrao_id": 30
  },
  {
    "id": 53,
    "nome_civil": "Micaela Araújo",
    "nome_praxe": "Mantis Cho Yang Bimba y Lola",
    "ano_entrada": null,
    "patrao_id": 30
  },
  {
    "id": 54,
    "nome_civil": "Rafael Pepê",
    "nome_praxe": "Rocket Weasly Bimba y Lola",
    "ano_entrada": null,
    "patrao_id": 30
  },
  {
    "id": 55,
    "nome_civil": "Francisco Júlio",
    "nome_praxe": "Frode Scrat Daniels Mau Bagaceira do Demónio",
    "ano_entrada": null,
    "patrao_id": 38
  },
  {
    "id": 56,
    "nome_civil": "Ana Luísa",
    "nome_praxe": "Alfild 1904 das neves Daniels Mau Magik Bagaceira Vilartona",
    "ano_entrada": null,
    "patrao_id": 39
  },
  {
    "id": 57,
    "nome_civil": "Helena Pinela",
    "nome_praxe": "Hilde Dumbledore Watermelon Daniel's Mau Magik Bagaceira Vilartona",
    "ano_entrada": null,
    "patrao_id": 39
  },
  {
    "id": 58,
    "nome_civil": "João Luís",
    "nome_praxe": "Johan LeBron James Daniels Mau Magik Bagaceira Vilartona",
    "ano_entrada": null,
    "patrao_id": 39
  },
  {
    "id": 59,
    "nome_civil": "Carolina Melo",
    "nome_praxe": "Khyara Mozart de Ouro Daniel's Má Bagaceira Chemical X",
    "ano_entrada": null,
    "patrao_id": 40
  },
  {
    "id": 60,
    "nome_civil": "íris Alves",
    "nome_praxe": "Ingegerd HotWeels de Bolhas Daniel's Má Bagaceira Chemical X",
    "ano_entrada": null,
    "patrao_id": 40
  },
  {
    "id": 61,
    "nome_civil": "Lara Marques",
    "nome_praxe": "Lagertha BlackSwan de Flores Daniel's Má Bagaceira Chemical X",
    "ano_entrada": null,
    "patrao_id": 40
  }
]

export const transferToFirebase = async () => {
  console.log("🚀 A iniciar transferência para o Firebase...");

  try {
    for (const member of familyData) {
      const docId = member.id.toString();
      const docRef = doc(db, "familia", docId);
      
      const dataToUpload = {
        id: docId,
        nome_civil: member.nome_civil || "",
        nome_praxe: member.nome_praxe || "",
        ano_entrada: member.ano_entrada ?? null, 
        patrao_id: member.patrao_id ? member.patrao_id.toString() : null,
        tipo: member.tipo || "Natural",
        status: "active"
      };

      await setDoc(docRef, dataToUpload);
      console.log(`✅ Membro ${docId} (${member.nome_praxe || member.nome_civil}) transferido.`);
    }
    console.log("⭐ Transferência de membros concluída!");

    await uploadCursos();
  } catch (error) {
    console.error("❌ Erro ao transferir:", error);
    throw error;
  }
};

const cursoData = [
  { nome: "Bioquímica", cor_tshirt: "#87CEEB" },
  { nome: "Química", cor_tshirt: "#87CEEB" },
  { nome: "Biotecnologia", cor_tshirt: "#87CEEB" },
  { nome: "Matemática", cor_tshirt: "#87CEEB" },
  { nome: "Engenharia Mecânica", cor_tshirt: "#F97316" },
  { nome: "Educação básica", cor_tshirt: "#FBCFE8" },
  { nome: "Administração Pública", cor_tshirt: "#1E3A8A" },
  { nome: "Enfermagem", cor_tshirt: "#22C55E" },
  { nome: "Fisioterapia", cor_tshirt: "#22C55E" },
  { nome: "Terapia da fala", cor_tshirt: "#22C55E" },
  { nome: "Imagem médica e radioterapia", cor_tshirt: "#22C55E" },
  { nome: "Engenharia Informática", cor_tshirt: "#22C55E" },
  { nome: "Engenharia Física", cor_tshirt: "#EAB308" },
  { nome: "Física", cor_tshirt: "#EAB308" },
  { nome: "Medicina", cor_tshirt: "#EAB308" },
  { nome: "Engenharia de Computadores e Informática", cor_tshirt: "#EAB308" },
  { nome: "Design", cor_tshirt: "#EF4444" },
  { nome: "Economia", cor_tshirt: "#EF4444" },
  { nome: "Engenharia Eletrotécnica e de Computadores", cor_tshirt: "#000000" },
  { nome: "Engenharia Aeroespacial", cor_tshirt: "#000000" }
];

export const uploadCursos = async () => {
  console.log("🚀 A iniciar transferência de cursos para o Firebase...");
  try {
    for (const curso of cursoData) {
      const docId = curso.nome.toLowerCase().replace(/\s+/g, '-');
      const docRef = doc(db, "cursos", docId);
      await setDoc(docRef, curso);
      console.log(`✅ Curso ${curso.nome} transferido.`);
    }
    console.log("⭐ Transferência de cursos concluída!");
  } catch (error) {
    console.error("❌ Erro ao transferir cursos:", error);
  }
};
