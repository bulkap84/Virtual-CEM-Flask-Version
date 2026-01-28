import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCEMForDealer, type CEM } from '../data/cemData';
import { Mail, Calendar, ExternalLink, Loader2 } from 'lucide-react';

export default function CEMFinder() {
    const { dealer } = useAuth();
    const [cem, setCem] = useState<CEM | null>(null);

    useEffect(() => {
        if (dealer) {
            const foundCEM = getCEMForDealer(dealer.id);
            setCem(foundCEM || null);
        }
    }, [dealer]);

    if (!cem) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg border border-dashed h-full">
                <Loader2 className="animate-spin text-primary mb-3" size={24} />
                <div className="text-muted-foreground italic text-sm">Identifying your success manager...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Manager Profile Card */}
            <div className="flex flex-col items-center p-6 bg-card rounded-lg border shadow-sm mb-6 transition-all hover:border-primary/20">
                <div className="relative mb-4 group">
                    {cem.photoUrl ? (
                        <img
                            src={cem.photoUrl}
                            alt={cem.name}
                            className="w-20 h-20 rounded-full object-cover border-4 border-background shadow-md group-hover:scale-105 transition-transform"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-md group-hover:scale-105 transition-transform">
                            <span className="text-2xl font-bold text-primary">{cem.name.charAt(0)}</span>
                        </div>
                    )}
                    <div className={`absolute bottom-0 right-1 w-5 h-5 rounded-full border-2 border-background shadow-sm ${cem.isOutOfOffice ? 'bg-orange-500' : 'bg-primary'}`} title={cem.isOutOfOffice ? "Out of Office" : "Available"}></div>
                </div>

                <h3 className="text-lg font-bold text-foreground text-center">{cem.name}</h3>
                <p className="text-xs text-muted-foreground text-center mb-3 font-medium uppercase tracking-wider">Success Manager</p>

                {cem.isOutOfOffice && (
                    <span className="px-3 py-1 bg-orange-500/10 text-orange-600 text-[10px] font-bold rounded-full uppercase">
                        Currently Away
                    </span>
                )}
            </div>

            {/* Support Channels */}
            <div className="flex-1 space-y-3">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-2">Direct Support</h4>

                <button className="w-full flex items-center p-3 bg-card border rounded-md hover:bg-accent hover:border-accent-foreground/20 transition-all text-left">
                    <div className="p-2 bg-primary/10 text-primary rounded-sm mr-3">
                        <Mail size={16} />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground">Email</div>
                        <div className="text-[11px] text-muted-foreground truncate">{cem.email}</div>
                    </div>
                </button>

                <div className="pt-3">
                    <a href={cem.calendarLink} target="_blank" rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 p-3 bg-primary text-white rounded-md text-sm font-bold shadow-md hover:opacity-90 transition-all active:scale-[0.98]">
                        <Calendar size={18} />
                        Schedule with me
                        <ExternalLink size={12} className="opacity-50 ml-1" />
                    </a>
                </div>
            </div>
        </div>
    );
}
