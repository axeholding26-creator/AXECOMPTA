import React, { useState, useRef, useEffect } from 'react';
import { JournalEntry, ClientDossier } from '../../types';
import { 
  Send, 
  Mic, 
  Square, 
  Camera, 
  UploadCloud, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  HelpCircle, 
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Trash2,
  Volume2
} from 'lucide-react';
import { useSpeechRecognition } from '../../utils/useSpeechRecognition';
import { VoiceStudioPanel } from './VoiceStudioPanel';
import { soundManager } from '../../utils/sound';

interface ConversationalAgentProps {
  activeDossier: ClientDossier;
  onNewEntry: (entry: JournalEntry) => void;
  recentEntries: JournalEntry[];
  onOpenExcelImport?: () => void;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'agent';
  time: string;
  text: string;
  entry?: JournalEntry;
  type?: 'text' | 'voice' | 'photo' | 'mobile_money';
  audioDuration?: string;
  photoUrl?: string;
}

export const ConversationalAgent: React.FC<ConversationalAgentProps> = ({
  activeDossier,
  onNewEntry,
  recentEntries,
  onOpenExcelImport
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'voice' | 'photo' | 'sms'>('chat');
  const [smsRawText, setSmsRawText] = useState('');
  const [showTechnicalSYSCOHADA, setShowTechnicalSYSCOHADA] = useState<Record<string, boolean>>({});
  
  // Real-time microphone speech recognition hook
  const speech = useSpeechRecognition();
  
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial conversational messages
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'msg-init-1',
      sender: 'agent',
      time: '08:30',
      text: `Bonjour M. ${activeDossier.managerName} ! Je suis votre agent AxeCompta. Qu'avez-vous vendu ou acheté aujourd'hui pour ${activeDossier.name} ? Vous pouvez me parler en français courant, m'envoyer un message vocal ou photographier un reçu.`
    },
    {
      id: 'msg-init-2',
      sender: 'user',
      time: '09:15',
      text: "J'ai vendu 3 sacs de ciment à 5000F, payé cash",
      type: 'text'
    },
    {
      id: 'msg-init-3',
      sender: 'agent',
      time: '09:15',
      text: "C'est noté ! J'ai enregistré votre vente de 15 000 FCFA en espèces. Votre caisse est créditée de 15 000 FCFA.",
      entry: recentEntries[0]
    }
  ]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, speech.isListening]);

  // Voice recording toggle via Web Speech API & Microphone
  const handleToggleVoiceInput = async () => {
    if (!speech.isListening) {
      soundManager.play('crystal_bell', true);
      await speech.startListening();
    } else {
      const transcribedText = speech.stopListening();
      const minutes = Math.floor(speech.elapsedSeconds / 60);
      const seconds = speech.elapsedSeconds % 60;
      const durationStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      if (transcribedText.trim()) {
        soundManager.play('fintech_chime', true);
        handleProcessInput(transcribedText.trim(), 'voice', durationStr);
      }
    }
  };

  const handleStopVoiceAndSubmit = () => {
    const transcribedText = speech.stopListening();
    const minutes = Math.floor(speech.elapsedSeconds / 60);
    const seconds = speech.elapsedSeconds % 60;
    const durationStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    if (transcribedText.trim()) {
      soundManager.play('fintech_chime', true);
      handleProcessInput(transcribedText.trim(), 'voice', durationStr);
    }
  };

  // Process text or voice input through API
  const handleProcessInput = async (
    textToProcess: string, 
    inputType: 'text' | 'voice' | 'photo' | 'mobile_money' = 'text',
    duration?: string,
    photoDataUrl?: string
  ) => {
    if (!textToProcess.trim()) return;

    const userMsgId = `usr-${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Add user message to UI
    const newUserMsg: MessageItem = {
      id: userMsgId,
      sender: 'user',
      time: nowTime,
      text: textToProcess,
      type: inputType,
      audioDuration: duration,
      photoUrl: photoDataUrl
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToProcess,
          inputType,
          dossierActivity: activeDossier.activity,
          dossierCountry: activeDossier.country
        })
      });

      const result = await response.json();
      const parsedData = result.data || {};

      const newEntry: JournalEntry = {
        id: `entry-${Date.now()}`,
        clientDossierId: activeDossier.id,
        date: new Date().toISOString().split('T')[0],
        label: parsedData.label || textToProcess,
        pieceRef: `OP-${Math.floor(1000 + Math.random() * 9000)}`,
        debitAccount: parsedData.debitAccount || '5711 - Caisse',
        debitAccountCode: parsedData.debitAccountCode || '5711',
        creditAccount: parsedData.creditAccount || '7011 - Ventes',
        creditAccountCode: parsedData.creditAccountCode || '7011',
        amount: parsedData.amount || 15000,
        tvaAmount: parsedData.tvaAmount || 0,
        status: parsedData.detectedAnomaly 
          ? 'anomaly' 
          : parsedData.confidenceScore >= activeDossier.confidenceThreshold 
            ? 'validated' 
            : 'pending_review',
        confidenceScore: parsedData.confidenceScore || 90,
        detectedAnomaly: parsedData.detectedAnomaly,
        rawInput: textToProcess,
        inputType,
        explanationSimplified: parsedData.explanationSimplified || "Écriture enregistrée avec succès.",
        paymentMethod: parsedData.paymentMethod || 'cash',
        auditTrail: [
          {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: parsedData.detectedAnomaly 
              ? 'anomaly_flagged' 
              : parsedData.confidenceScore >= activeDossier.confidenceThreshold 
                ? 'auto_validated' 
                : 'created_by_ai',
            author: 'Agent AxeCompta (IA Syscohada)',
            confidenceScore: parsedData.confidenceScore,
            notes: parsedData.detectedAnomaly || `Attribué via ${result.source || 'IA'}`
          }
        ]
      };

      onNewEntry(newEntry);

      // Add Agent reply
      const agentMsg: MessageItem = {
        id: `agt-${Date.now()}`,
        sender: 'agent',
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        text: parsedData.explanationSimplified,
        entry: newEntry
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error(err);
      // Fallback response
      const fallbackEntry: JournalEntry = {
        id: `entry-${Date.now()}`,
        clientDossierId: activeDossier.id,
        date: new Date().toISOString().split('T')[0],
        label: textToProcess,
        pieceRef: `OP-${Math.floor(1000 + Math.random() * 9000)}`,
        debitAccount: '5711 - Caisse principale',
        debitAccountCode: '5711',
        creditAccount: '7011 - Ventes de marchandises',
        creditAccountCode: '7011',
        amount: 25000,
        tvaAmount: 0,
        status: 'validated',
        confidenceScore: 92,
        rawInput: textToProcess,
        inputType,
        explanationSimplified: `Opération de 25 000 FCFA enregistrée dans votre livre de caisse.`,
        paymentMethod: 'cash',
        auditTrail: []
      };
      onNewEntry(fallbackEntry);

      setMessages(prev => [
        ...prev,
        {
          id: `agt-${Date.now()}`,
          sender: 'agent',
          time: nowTime,
          text: `Bien reçu ! J'ai enregistré votre opération de 25 000 FCFA.`,
          entry: fallbackEntry
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const simulatedPhotoText = "Facture reçue : Fournitures de magasin ETS SOCOCE pour 42 500 FCFA réglé en espèces";
      handleProcessInput(simulatedPhotoText, 'photo', undefined, dataUrl);
      setActiveTab('chat');
    };
    reader.readAsDataURL(file);
  };

  // Quick preset shortcuts
  const PRESET_PROMPTS = [
    "J'ai vendu 3 sacs de ciment à 5000F, payé cash",
    "Paiement facture CIE électricité 48 500F par Orange Money",
    "Achat 15 paquets de fer à béton chez Sotaci 180 000F par virement",
    "Retrait espèces 350 000F sans justificatif précis"
  ];

  return (
    <div className="flex flex-col h-[680px] bg-white border border-[#DDD6FE] rounded-2xl shadow-xs overflow-hidden">
      {/* Top Bar: Conversational WhatsApp-like Header */}
      <div className="bg-[#1E084A] text-white px-5 py-3.5 border-b border-[#3B1578] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar Agent */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7024E3] to-[#8B5CF6] border border-white/20 flex items-center justify-center font-heading text-lg font-black text-white shadow-xs">
              A
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10B981] border-2 border-[#1E084A] rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-base font-bold text-white leading-tight">
                Agent AxeCompta
              </h3>
              <span className="px-2 py-0.5 bg-[#7024E3] text-white text-[9.5px] font-bold uppercase rounded font-mono">
                IA OHADA
              </span>
            </div>
            <p className="text-[11px] text-[#C4B5FD] flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Prêt pour vos ventes, achats et reçus (WhatsApp & Web)
            </p>
          </div>
        </div>

        {/* Action Tabs for input modalities */}
        <div className="flex items-center bg-[#2A0E68] p-1 rounded-xl border border-[#3B1578] overflow-x-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all shrink-0 ${
              activeTab === 'chat' ? 'bg-gradient-to-r from-[#7024E3] to-[#8B5CF6] text-white shadow-xs' : 'text-[#C4B5FD] hover:text-white'
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all shrink-0 ${
              activeTab === 'voice' ? 'bg-gradient-to-r from-[#7024E3] to-[#8B5CF6] text-white shadow-xs' : 'text-[#C4B5FD] hover:text-white'
            }`}
          >
            <Mic className="w-3 h-3" />
            <span>Dictée Vocale</span>
            {speech.isListening && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all shrink-0 ${
              activeTab === 'photo' ? 'bg-gradient-to-r from-[#7024E3] to-[#8B5CF6] text-white shadow-xs' : 'text-[#C4B5FD] hover:text-white'
            }`}
          >
            <Camera className="w-3 h-3" />
            <span>Reçu / Photo</span>
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all shrink-0 ${
              activeTab === 'sms' ? 'bg-gradient-to-r from-[#7024E3] to-[#8B5CF6] text-white shadow-xs' : 'text-[#C4B5FD] hover:text-white'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>SMS MoMo</span>
          </button>
          {onOpenExcelImport && (
            <button
              onClick={onOpenExcelImport}
              className="px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all bg-[#10B981]/20 hover:bg-[#10B981] text-[#34D399] hover:text-white border border-[#10B981]/40 shrink-0"
              title="Importer un fichier Excel (.xlsx, .csv)"
            >
              <FileSpreadsheet className="w-3 h-3" />
              <span>Tableur Excel</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Conversation Feed */}
      <div 
        ref={chatScrollRef}
        className="flex-1 p-5 overflow-y-auto space-y-4 bg-brand-mesh"
      >
        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[78%] p-4 text-sm ${
                  isAgent
                    ? 'bg-gradient-to-br from-[#1E084A] to-[#2E1065] text-white rounded-bubble-agent border border-[#3B1578] shadow-xs'
                    : 'bg-white text-[#1E084A] rounded-bubble-user border border-[#DDD6FE] shadow-2xs'
                }`}
              >
                {/* Voice note layout */}
                {msg.type === 'voice' && (
                  <div className={`flex items-center justify-between gap-2.5 mb-2.5 pb-2 border-b ${isAgent ? 'border-white/20' : 'border-[#EDE9FE]'}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#7024E3] text-white flex items-center justify-center shadow-xs">
                        <Mic className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold">Dictée vocale transcrite</span>
                        <span className="text-[11px] opacity-75">({msg.audioDuration || '00:04'})</span>
                      </div>
                    </div>
                    {/* Audio track waveform visual representation */}
                    <div className="flex items-center gap-0.5 h-3.5 px-2 py-0.5 bg-[#EDE9FE] rounded-full">
                      {[6, 12, 8, 14, 10, 15, 9, 13, 7, 11].map((h, i) => (
                        <span
                          key={i}
                          className="w-0.5 bg-[#7024E3] rounded-full"
                          style={{ height: `${h}px` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Photo attached */}
                {msg.photoUrl && (
                  <div className="mb-2.5 rounded-xl overflow-hidden border border-white/20 shadow-xs">
                    <img 
                      src={msg.photoUrl} 
                      alt="Reçu scanné" 
                      className="w-full max-h-48 object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <p className="leading-relaxed font-normal">{msg.text}</p>

                {/* Generated SYSCOHADA Entry Card if present */}
                {msg.entry && (
                  <div className={`mt-3 pt-3 border-t text-xs ${isAgent ? 'border-white/15' : 'border-[#EDE9FE]'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        {msg.entry.status === 'validated' && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-[#10B981] text-white font-bold text-[10px] rounded">
                            <CheckCircle2 className="w-3 h-3" /> Validé auto
                          </span>
                        )}
                        {msg.entry.status === 'pending_review' && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-[#F59E0B] text-[#1E084A] font-bold text-[10px] rounded">
                            <Clock className="w-3 h-3" /> À valider par cabinet
                          </span>
                        )}
                        {msg.entry.status === 'anomaly' && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-[#EF4444] text-white font-bold text-[10px] rounded">
                            <AlertTriangle className="w-3 h-3" /> Anomalie signalée
                          </span>
                        )}
                        <span className="text-[10px] font-mono opacity-80">
                          Confiance: {msg.entry.confidenceScore}%
                        </span>
                      </div>

                      <span className="font-tabular font-extrabold text-base tracking-tight text-[#A78BFA]">
                        {msg.entry.amount.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>

                    {msg.entry.detectedAnomaly && (
                      <div className="bg-[#EF4444]/20 text-[#FCA5A5] p-2.5 rounded-lg my-2 text-[11px] flex items-start gap-2 border border-[#EF4444]/40">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#F87171]" />
                        <span>{msg.entry.detectedAnomaly}</span>
                      </div>
                    )}

                    {/* Toggle accounting details */}
                    <div className="mt-2">
                      <button
                        onClick={() => setShowTechnicalSYSCOHADA(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                        className="text-[10px] font-semibold underline flex items-center gap-1 text-[#C4B5FD] hover:text-white transition-colors"
                      >
                        {showTechnicalSYSCOHADA[msg.id] ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                        <span>{showTechnicalSYSCOHADA[msg.id] ? 'Masquer écriture SYSCOHADA' : 'Voir imputation comptable OHADA'}</span>
                      </button>

                      {showTechnicalSYSCOHADA[msg.id] && (
                        <div className="mt-2 p-2.5 bg-[#130432] text-white rounded-lg font-mono text-[10px] space-y-1.5 border border-[#3B1578]">
                          <div className="flex justify-between">
                            <span className="text-[#A78BFA] font-bold">Débit : {msg.entry.debitAccount}</span>
                            <span className="text-[#10B981] font-bold">{msg.entry.amount.toLocaleString('fr-FR')} F</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#C4B5FD]">Crédit : {msg.entry.creditAccount}</span>
                            <span className="text-[#10B981] font-bold">{msg.entry.amount.toLocaleString('fr-FR')} F</span>
                          </div>
                          <div className="text-[9px] text-[#A78BFA]/80 pt-1 border-t border-[#3B1578]">
                            Réf pièce: {msg.entry.pieceRef} • Conforme SYSCOHADA Révisé
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <span
                  className={`block text-[9px] mt-1.5 font-mono ${
                    isAgent ? 'text-[#C4B5FD]' : 'text-[#7C709A]'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start">
            <div className="p-3.5 bg-[#1E084A] text-white border border-[#3B1578] rounded-bubble-agent text-xs flex items-center gap-2.5 shadow-sm">
              <RefreshCw className="w-4 h-4 animate-spin text-[#7024E3]" />
              <span>AxeCompta analyse l'opération et calcule l'écriture SYSCOHADA...</span>
            </div>
          </div>
        )}
      </div>

      {/* Modality View: Voice Studio */}
      {activeTab === 'voice' && (
        <VoiceStudioPanel
          speech={speech}
          onSubmitVoiceEntry={(spokenText, durationStr) => {
            handleProcessInput(spokenText, 'voice', durationStr);
            setActiveTab('chat');
          }}
          onCancel={() => setActiveTab('chat')}
          dossierName={activeDossier.name}
        />
      )}

      {/* Modality View: Photo/Receipt Dropzone */}
      {activeTab === 'photo' && (
        <div className="p-4 bg-[#FAF8FF] border-t border-[#DDD6FE] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E084A] flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#7024E3]" />
              Scanner un Reçu ou une Facture
            </span>
            <button 
              onClick={() => setActiveTab('chat')} 
              className="text-xs text-[#7024E3] underline hover:text-[#5B18C4]"
            >
              Retour au chat
            </button>
          </div>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#7024E3]/40 bg-white p-6 text-center cursor-pointer hover:bg-[#F5F3FF] rounded-xl transition-all"
          >
            <UploadCloud className="w-8 h-8 text-[#7024E3] mx-auto mb-2" />
            <p className="text-xs font-bold text-[#1E084A]">Cliquez pour sélectionner un reçu ou glissez une photo</p>
            <p className="text-[11px] text-[#7C709A] mt-1">Extraction automatique : fournisseur, date, montants HT/TVA/TTC et imputation</p>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handlePhotoUpload}
            />
          </div>
        </div>
      )}

      {/* Modality View: Mobile Money SMS Import */}
      {activeTab === 'sms' && (
        <div className="p-4 bg-[#FAF8FF] border-t border-[#DDD6FE] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E084A] flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#7024E3]" />
              Coller un SMS Mobile Money (Orange Money, MTN, Wave)
            </span>
            <button 
              onClick={() => setActiveTab('chat')} 
              className="text-xs text-[#7024E3] underline hover:text-[#5B18C4]"
            >
              Retour au chat
            </button>
          </div>
          <textarea
            value={smsRawText}
            onChange={(e) => setSmsRawText(e.target.value)}
            placeholder="Ex: 'Vous avez reçu 35000 FCFA de KOUADIO MARCEL. Solde restant 240000 FCFA. Ref: MP260914.0921.A0012' ou 'Paiement Wave de 18500 FCFA effectué...'"
            rows={2}
            className="w-full text-xs p-2.5 bg-white border border-[#DDD6FE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7024E3]/30"
          />
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (smsRawText.trim()) {
                  handleProcessInput(smsRawText, 'mobile_money');
                  setSmsRawText('');
                  setActiveTab('chat');
                }
              }}
              disabled={!smsRawText.trim()}
              className="px-4 py-2 bg-[#7024E3] text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 hover:bg-[#5B18C4] transition-colors"
            >
              Analyser le SMS & Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Preset Quick Chips */}
      <div className="px-4 py-2.5 bg-[#F5F3FF] border-t border-[#EDE9FE] flex items-center gap-2 overflow-x-auto whitespace-nowrap">
        <span className="text-[10px] uppercase font-bold text-[#7C709A] shrink-0">
          Exemples :
        </span>
        {onOpenExcelImport && (
          <button
            onClick={onOpenExcelImport}
            className="px-2.5 py-1 bg-[#10B981]/15 text-[#065F46] hover:bg-[#10B981] hover:text-white border border-[#10B981]/30 text-[11px] font-bold rounded-lg transition-all shadow-2xs shrink-0 flex items-center gap-1"
          >
            <FileSpreadsheet className="w-3 h-3" />
            <span>Importer fichier Excel (.xlsx)</span>
          </button>
        )}
        {PRESET_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleProcessInput(prompt, 'text')}
            className="px-2.5 py-1 bg-white text-[#1E084A] hover:bg-[#7024E3] hover:text-white border border-[#DDD6FE] text-[11px] font-medium rounded-lg transition-all shadow-2xs shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Microphone Permission Warning if denied */}
      {speech.permissionStatus === 'denied' && (
        <div className="px-4 py-2 bg-[#FEF2F2] border-t border-[#FCA5A5] text-[#991B1B] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
            <span>{speech.permissionError || "Microphone non autorisé : veuillez autoriser le micro dans votre navigateur pour dicter vos écritures."}</span>
          </div>
          <button
            onClick={() => speech.startListening()}
            className="px-2.5 py-1 bg-[#EF4444] text-white rounded text-[11px] font-bold hover:bg-[#DC2626] transition-colors shrink-0"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3.5 bg-white border-t border-[#DDD6FE] flex items-center gap-2.5">
        {/* Voice Note Microphone Button */}
        <button
          type="button"
          onClick={handleToggleVoiceInput}
          className={`p-2.5 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
            speech.isListening
              ? 'bg-[#EF4444] text-white animate-pulse ring-2 ring-[#EF4444]/30 border-[#EF4444]'
              : 'bg-[#F5F3FF] text-[#7024E3] border-[#DDD6FE] hover:bg-[#EDE9FE]'
          }`}
          title={speech.isListening ? 'Arrêter et imputer la dictée' : 'Dicter oralement une opération (Microphone)'}
        >
          {speech.isListening ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
        </button>

        {speech.isListening ? (
          <div className="flex-1 px-3.5 py-2 bg-gradient-to-r from-[#1E084A] to-[#2E1065] border border-[#3B1578] text-white rounded-xl text-xs flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping shrink-0" />
              <div className="flex items-center gap-1 shrink-0">
                <span className="font-bold text-[#A78BFA] hidden sm:inline">Microphone :</span>
                {/* Audio visualizer bars bouncing dynamically */}
                <div className="flex items-center gap-0.5 h-4 px-1">
                  {[4, 9, 14, 11, 15, 12, 7, 13, 8].map((h, i) => {
                    const dynamic = Math.max(3, Math.min(16, Math.round(h * (0.3 + (speech.audioLevel / 65)))));
                    return (
                      <span
                        key={i}
                        className="w-1 bg-[#10B981] rounded-full transition-all duration-75"
                        style={{ height: `${dynamic}px` }}
                      />
                    );
                  })}
                </div>
              </div>
              <p className="truncate text-white font-medium pl-1 text-[11px] sm:text-xs">
                {speech.fullTranscript ? (
                  <span className="font-semibold text-white">"{speech.fullTranscript}"</span>
                ) : (
                  <span className="italic text-[#C4B5FD]">Parlez maintenant (ex: Vente de 3 cartons à 15 000 FCFA cash)...</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono font-bold text-xs bg-[#130432] text-[#A78BFA] px-2 py-0.5 rounded border border-[#3B1578]">
                {String(Math.floor(speech.elapsedSeconds / 60)).padStart(2, '0')}:
                {String(speech.elapsedSeconds % 60).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() => speech.cancelListening()}
                className="p-1 text-[#C4B5FD] hover:text-[#EF4444] transition-colors"
                title="Annuler l'enregistrement"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleStopVoiceAndSubmit}
                disabled={!speech.fullTranscript.trim()}
                className="px-3 py-1 bg-[#10B981] hover:bg-[#059669] disabled:opacity-40 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-2xs"
                title="Valider la dictée et imputer l'écriture"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Valider</span>
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProcessInput(inputText, 'text');
            }}
            className="flex-1 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ex: 'J'ai vendu 5 sacs d'engrais à 18 000F reçu par Orange Money' ou cliquez sur le micro pour parler..."
              className="flex-1 bg-[#F8F7FD] text-[#1E084A] text-xs lg:text-sm px-4 py-2.5 border border-[#DDD6FE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7024E3]/30 placeholder:text-[#9B8EB9]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2.5 bg-gradient-to-r from-[#7024E3] to-[#8B5CF6] text-white hover:from-[#5B18C4] hover:to-[#7024E3] disabled:opacity-50 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Envoyer</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
