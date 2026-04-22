import React from "react";
import { AvatarConfig, Member } from "../../types";
import { calculateMatriculaYear } from "../../utils/dateUtils";
import AvatarRenderer from "./AvatarRenderer";
import { 
  SKIN_PAIRS, 
  BEARD_COLORS, 
  GLASSES_COLORS, 
  HAIR_COLORS 
} from "./AvatarParts";

interface AvatarEditorProps {
  member: Member;
  onChange: (config: AvatarConfig) => void;
}

const AvatarEditor: React.FC<AvatarEditorProps> = ({ member, onChange }) => {
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

  const updateConfig = (updates: Partial<AvatarConfig>) => {
    onChange({ ...config, ...updates });
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-slate-700 mb-3 uppercase tracking-wider">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );

  const ColorCircle = ({ color, active, onClick }: { color: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-full border-2 transition-all ${active ? 'border-blue-500 scale-110 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
      style={{ backgroundColor: color }}
    />
  );

  const realMatriculaYear = calculateMatriculaYear(member.ano_entrada);
  const showAdvancedClothing = realMatriculaYear > 1;

  return (
    <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex flex-col items-center gap-4 bg-[#fafafa] p-6 rounded-xl border border-slate-100">
        <AvatarRenderer member={member} size={200} className="shadow-xl ring-4 ring-white" />
        <p className="text-slate-500 text-sm font-medium">Pré-visualização do Avatar</p>
      </div>

      <div className="flex-1 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {/* Skin Selection */}
        <Section title="Tom de Pele">
          {SKIN_PAIRS.map((pair, idx) => (
            <button
              key={idx}
              onClick={() => updateConfig({ skinIndex: idx })}
              className={`w-10 h-10 rounded-lg border-2 overflow-hidden transition-all ${config.skinIndex === idx ? 'border-blue-500 scale-105' : 'border-slate-200'}`}
            >
              <div className="h-1/2 w-full" style={{ backgroundColor: pair.face }} />
              <div className="h-1/2 w-full" style={{ backgroundColor: pair.neck }} />
            </button>
          ))}
        </Section>

        {/* Hair Styles */}
        <Section title="Cabelo - Estilo">
          <button
            onClick={() => updateConfig({ hairIndex: 0 })}
            className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${config.hairIndex === 0 ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            Sem Cabelo
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => (
            <button
              key={idx}
              onClick={() => updateConfig({ hairIndex: idx })}
              className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${config.hairIndex === idx ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              {idx}
            </button>
          ))}
        </Section>

        {/* Hair Colors */}
        {config.hairIndex > 0 && (
          <Section title="Cabelo - Cor">
            {Object.entries(HAIR_COLORS).map(([name, hex]) => (
              <ColorCircle 
                key={name} 
                color={hex} 
                active={config.hairColor === name} 
                onClick={() => updateConfig({ hairColor: name })} 
              />
            ))}
          </Section>
        )}

        {/* Beard Styles */}
        <Section title="Barba / Bigode">
          <button
            onClick={() => updateConfig({ beardIndex: 0 })}
            className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${config.beardIndex === 0 ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            Sem Barba
          </button>
          {[1, 2, 3, 4].map((idx) => (
            <button
              key={idx}
              onClick={() => updateConfig({ beardIndex: idx })}
              className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${config.beardIndex === idx ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              {idx}
            </button>
          ))}
        </Section>

        {/* Beard Colors */}
        {config.beardIndex > 0 && (
          <Section title="Barba - Cor">
            {Object.entries(BEARD_COLORS).map(([name, hex]) => (
              <ColorCircle 
                key={name} 
                color={hex} 
                active={config.beardColor === name} 
                onClick={() => updateConfig({ beardColor: name })} 
              />
            ))}
          </Section>
        )}

        {/* Mouth Styles */}
        <Section title="Boca / Expressão">
          {[0, 1, 2, 3].map((idx) => (
            <button
              key={idx}
              onClick={() => updateConfig({ mouthIndex: idx })}
              className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${config.mouthIndex === idx ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              {idx + 1}
            </button>
          ))}
        </Section>

        {/* Glasses Styles */}
        <Section title="Óculos">
          <button
            onClick={() => updateConfig({ glassesIndex: 0 })}
            className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${config.glassesIndex === 0 ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            Sem Óculos
          </button>
          {[1, 2, 3].map((idx) => (
            <button
              key={idx}
              onClick={() => updateConfig({ glassesIndex: idx })}
              className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${config.glassesIndex === idx ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              {idx}
            </button>
          ))}
        </Section>

        {/* Glasses Colors */}
        {config.glassesIndex > 0 && (
          <Section title="Óculos - Cor">
            {Object.entries(GLASSES_COLORS).map(([name, hex]) => (
              <ColorCircle 
                key={name} 
                color={hex} 
                active={config.glassesColor === name} 
                onClick={() => updateConfig({ glassesColor: name })} 
              />
            ))}
          </Section>
        )}

        {/* Clothing Type */}
        {showAdvancedClothing && (
          <>
            <Section title="Tipo de Traje">
              <button
                onClick={() => updateConfig({ clothingType: 'male' })}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-bold transition-all ${config.clothingType === 'male' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
              >
                Masculino
              </button>
              <button
                onClick={() => updateConfig({ clothingType: 'female' })}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-bold transition-all ${config.clothingType === 'female' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
              >
                Feminino
              </button>
            </Section>

            {/* First Year Option */}
            <Section title="Situação Académica">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={config.isFirstYear} 
                  onChange={(e) => updateConfig({ isFirstYear: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700 font-medium group-hover:text-slate-900 transition-colors">Usar tshirt de Aluvião</span>
              </label>
            </Section>
          </>
        )}

        {/* White Net Option for 5th Year+ */}
        {(() => {
          const matriculaYear = calculateMatriculaYear(member.ano_entrada);
          if (matriculaYear < 5) return null;

          return (
            <Section title="Estatuto (5º Ano+)">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={!!config.hasWhiteNet} 
                  onChange={(e) => updateConfig({ hasWhiteNet: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                />
                <span className="text-slate-700 font-medium group-hover:text-slate-900 transition-colors">Adicionar Rede Branca (sobre a verde)</span>
              </label>
            </Section>
          );
        })()}
      </div>
    </div>
  );
};

export default AvatarEditor;
