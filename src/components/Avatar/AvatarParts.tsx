import React from "react";
import { AVATAR_PATHS } from "../../constants/AvatarPaths";
import { getCourseColors, AzelhaKnot } from "../KnotIcons";
import { getAluviãoColor } from "../../services/courseService";

// Colors defined by user
export const SKIN_PAIRS = [
  // Tons Claros / Pálidos
  { neck: "#EAB792", face: "#FCDBBC" },
  { neck: "#ED917D", face: "#F6C09E" },
  
  // Tons Médios / Oliva / Bronzeados
  { neck: "#E2783C", face: "#F5A462" },
  
  // Tons Escuros / Castanhos
  { neck: "#7B2B16", face: "#BB4B21" },
  { neck: "#613D30", face: "#8D5524" },
  
  // Tons Profundos / Retintos
  { neck: "#341B16", face: "#503335" },
];

export const BEARD_COLORS = {
  // Naturais Escuros
  preto: "#1A1A1B",
  castanhoEscuro: "#3D2314",
  castanho: "#4A2C2A",
  
  // Naturais Claros
  castanhoClaro: "#8D5524",
  loiroEscuro: "#B58950",
  loiro: "#D4A76A",
  loiroPlatinado: "#F5E1B2",
  
  // Ruivos
  ruivo: "#A34B2E",
  ruivoAcobreado: "#D66E38",
  
  // Maturidade
  cinza: "#A0A0A0",
  cinzaEscuro: "#535353",
  branco: "#E8E8E8",
  
  // Estilo / Fantasia
  azulMeiaNoite: "#2C3E50",
  rosaPastel: "#F191B1",
  roxo: "#7D3C98",
};

export const GLASSES_COLORS = {
  // Clássicos e Neutros
  preto: "#1A1A1A",
  cinza: "#666666",
  branco: "#FFFFFF",
  transparente: "#E1E8ED", // Um cinza azulado muito claro para simular acrílico

  // Metálicos (Essenciais para óculos)
  ouro: "#D4AF37",
  prata: "#C0C0C0",
  bronze: "#855E42",

  // Tons Profundos (Sóbrios)
  azul_escuro: "#1B263B",
  verde_escuro: "#1B4332",
  vermelho_escuro: "#7B0D1E",

  // Cores Vibrantes (Pop)
  vermelho: "#E63946",
  azul_claro: "#33BBFF",
  verde_claro: "#52B788",
  amarelo: "#FFD60A",
  rosa: "#FF85A1",
  tartaruga: "#633924", // Tom castanho manchado clássico
};

export const HAIR_COLORS = BEARD_COLORS;

// Basic SVG generic parts for the avatar
export const FaceBase: React.FC<{ skin: { neck: string; face: string } }> = ({ skin }) => (
  <g id="skin-layer">
    {/* 1. Pescoço e Orelhas */}
    {AVATAR_PATHS.cara.neck.map((path, i) => (
      <path 
        key={`neck-ears-${i}`} 
        d={path} 
        fill={skin.neck} // Agora usa a cor do par selecionado
      />
    ))}

    {/* 2. Rosto */}
    <path d={AVATAR_PATHS.cara.rosto} fill={skin.face} />
  </g>
);

export const Eyes: React.FC = () => (
  <g id="eyes">
    <g transform="scale(1, -1)">
      <image 
        href="/olhos.png" 
        x="-200" 
        y="-20480" // Valor total da tela
        width="20480" 
        height="20480" 
      />
    </g>
  </g>
);

export const MouthRenderer: React.FC<{ index: number }> = ({ index }) => {
  const mouthFiles = ["/boca1.png", "/boca2.png", "/boca3.png", "/boca4.png"];
  return (
    <g id="mouth">
      <g transform="scale(1, -1)">
        <image 
          href={mouthFiles[index % mouthFiles.length]} 
          x="-200" 
          y="-20480" 
          width="20480" 
          height="20480" 
        />
      </g>
    </g>
  );
};

export const HairRenderer: React.FC<{ index: number; color: string }> = ({ index, color }) => {
  if (index === 0) return null;
  const hairKey = `cabelo${index}` as keyof typeof AVATAR_PATHS.cabelos;
  const paths = AVATAR_PATHS.cabelos[hairKey];

  return (
    <g id="hair">
      {Array.isArray(paths) ? (
        paths.map((p, i) => <path key={i} d={p} fill={color} />)
      ) : (
        <path d={paths as string} fill={color} />
      )}
    </g>
  );
};

export const BeardRenderer: React.FC<{ index: number; color: string }> = ({ index, color }) => {
  if (index === 0) return null;
  const beardKey = `barba${index}` as keyof typeof AVATAR_PATHS.barbas;
  const path = AVATAR_PATHS.barbas[beardKey];
  return (
    <g id="beard">
      <path d={path} fill={color} />
    </g>
  );
};

export const GlassesRenderer: React.FC<{ index: number; color: string }> = ({ index, color }) => {
  if (index === 0) return null;
  const glassesKey = `oculos${index}` as keyof typeof AVATAR_PATHS.oculos;
  const path = AVATAR_PATHS.oculos[glassesKey];
  return (
    <g id="glasses">
      <path d={path} fill={color} stroke="none" />
    </g>
  );
};

export const ClothingRenderer: React.FC<{ 
  type: 'male' | 'female'; 
  isFirstYear: boolean; 
  course?: string;
  matriculaYear: number;
}> = ({ type, isFirstYear, course, matriculaYear }) => {
  const aluviaoColor = getAluviãoColor(course);
  const isFemale = type === 'female';
  // Se for 1º ano (automático ou manual), usa sempre a T-shirt
  const forceTshirt = isFirstYear || matriculaYear <= 1;
  
  return (
    <g id="clothing">
      {forceTshirt ? (
        <path d={AVATAR_PATHS.traje.tshirt} fill={aluviaoColor} />
      ) : (
        /* Criamos um sub-grupo para corrigir a orientação da imagem */
        <g transform="scale(1, -1)"> 
          <image 
            href={isFemale ? "/traje_f.png" : "/traje_m.png"} 
            x="-200"                   // Começa no limite esquerdo da tela original
            y="-20480"              // Altura total negativa (2048 * 10 por causa do scale 0.1)
            width="20480"           // Largura total da tela original
            height="20480"          // Altura total da tela original
          />
        </g>
      )}
    </g>
  );
};

export const KnotsRenderer: React.FC<{ 
  matriculaYear: number; 
  gender: 'male' | 'female';
  hasWhiteNet?: boolean;
  course?: string;
}> = ({ matriculaYear, gender, hasWhiteNet = false, course }) => {
  // 1º ano: matriculaYear === 1 -> Sem nós
  if (matriculaYear <= 1) return null;

  const isFemale = gender === 'female';
  const { primary, secondary } = getCourseColors(course);

  return (
    <g id="avatar-knots">
      {/* Grupo para corrigir a orientação Y de todas as imagens de uma vez */}
      <g transform="scale(1, -1)">
        
        {/* Camadas de nós: Ordem visual Cru, Castanho, Verde, Azelha */}
        {matriculaYear >= 4 && (
          <image 
            href="/no_cru.png" 
            x="-200" 
            y="-20480" 
            width="20480" 
            height="20480" 
          />
        )}

        {matriculaYear >= 3 && (
          <image 
            href="/no_castanho.png" 
            x="-200" 
            y="-20480" 
            width="20480" 
            height="20480" 
          />
        )}

        {matriculaYear >= 2 && (
          <image 
            href="/no_verde.png" 
            x="-200" 
            y="-20480" 
            width="20480" 
            height="20480" 
          />
        )}

        {matriculaYear >= 2 && (
          <g transform="translate(9000, -2000)">
             <AzelhaKnot primary={primary} secondary={secondary} size={800} />
          </g>
        )}

        {/* 5º ano ou superior: adiciona a rede verde sempre */}
        {matriculaYear >= 5 && (
          <image 
            href={isFemale ? "/rede_f.png" : "/rede_m.png"} 
            x="-200" 
            y="-20480" 
            width="20480" 
            height="20480" 
            style={{ opacity: 0.95 }}
          />
        )}

        {/* 5º ano ou superior: adiciona a rede branca opcional por cima */}
        {matriculaYear >= 5 && hasWhiteNet && (
          <image 
            href={isFemale ? "/rede_b_f.png" : "/rede_b_m.png"} 
            x="-200" 
            y="-20480" 
            width="20480" 
            height="20480" 
            style={{ opacity: 0.9 }}
          />
        )}
        
      </g>
    </g>
  );
};
