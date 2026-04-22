import React from "react";
import { AvatarConfig, Member } from "../../types";
import { calculateMatriculaYear } from "../../utils/dateUtils";
import { 
  FaceBase, 
  Eyes, 
  MouthRenderer, 
  HairRenderer, 
  BeardRenderer, 
  GlassesRenderer, 
  ClothingRenderer,
  KnotsRenderer,
  SKIN_PAIRS,
  BEARD_COLORS,
  HAIR_COLORS,
  GLASSES_COLORS
} from "./AvatarParts";

interface AvatarRendererProps {
  member: Member;
  size?: number;
  className?: string;
}

const AvatarRenderer: React.FC<AvatarRendererProps> = ({ member, size = 100, className = "" }) => {
  const config = member.avatar || {
    skinIndex: 0,
    mouthIndex: 0,
    beardIndex: 0,
    beardColor: "preto",
    glassesIndex: 0,
    glassesColor: "preto",
    hairIndex: 0,
    hairColor: "preto",
    clothingType: 'male',
    isFirstYear: true,
  };

  const skin = SKIN_PAIRS[config.skinIndex % SKIN_PAIRS.length];
  const bColor = (BEARD_COLORS as any)[config.beardColor] || BEARD_COLORS.preto;
  const hColor = (HAIR_COLORS as any)[config.hairColor] || HAIR_COLORS.preto;
  const gColor = (GLASSES_COLORS as any)[config.glassesColor] || GLASSES_COLORS.preto;
  
  const matriculaYear = config.isFirstYear ? 1 : calculateMatriculaYear(member.ano_entrada);

  return (
    <div className={`relative inline-block overflow-hidden rounded-full bg-[#fafafa] ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="5000 2500 10000 17000"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="5000" y="2500" width="10000" height="17000" fill="#fafafa" />
        
        {/* We use a transform to flip the Y axis because the paths seem to use a bottom-up system */}
        <g transform="translate(0, 21000) scale(1, -1)">
          {/* Layered assembly as requested: fundo -> topo */}
          
          {/* 1. Cara (Shadows then Rosto then Eyes) */}
          <FaceBase skin={skin} />
          <Eyes />
          
          {/* 2. Bocas */}
          <MouthRenderer index={config.mouthIndex} />
          
          {/* 4. Óculos */}
          <GlassesRenderer index={config.glassesIndex} color={gColor} />
          
          {/* 5. Cabelos */}
          <HairRenderer index={config.hairIndex} color={hColor} />
          
          {/* 6. Traje */}
          <ClothingRenderer 
            type={config.clothingType} 
            isFirstYear={config.isFirstYear} 
            course={member.curso_faina}
            matriculaYear={matriculaYear}
          />
          
          {/* 7. Nós */}
          <KnotsRenderer 
            matriculaYear={matriculaYear} 
            gender={config.clothingType} 
            hasWhiteNet={config.hasWhiteNet}
            course={member.curso_faina}
          />

          {/* 3. Barba */}
          <BeardRenderer index={config.beardIndex} color={bColor} />
        </g>
      </svg>
    </div>
  );
};

export default AvatarRenderer;
