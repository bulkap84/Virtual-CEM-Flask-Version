
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, ChevronDown } from 'lucide-react';
import { DEALERS } from '../data/cemData';
import CEMFinder from '../components/CEMFinder';
import ChatInterface from '../components/ChatInterface';

// Placeholder components to prevent build errors
// We will implement them properly in the next steps
const PlaceholderCEMFinder = () => <div className="p-4 bg-white rounded shadow h-full">CEM Finder Panel (Coming Soon)</div>;
const PlaceholderChatInterface = () => <div className="p-4 bg-white rounded shadow h-full">Virtual Performance Coach Chat (Coming Soon)</div>;

const RealCEMFinder = CEMFinder || PlaceholderCEMFinder;
const RealChatInterface = ChatInterface || PlaceholderChatInterface;

export default function Home() {
    const { user, dealer, setDealer } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
                <div></div>

                <div className="flex items-center gap-3">
                    {/* Dealer Selection Dropdown (High Visibility fallback) */}
                    <div className="relative group mr-4 hidden md:block">
                        <select
                            className="appearance-none bg-muted/50 border rounded-sm px-4 py-1.5 pr-8 text-xs font-semibold text-muted-foreground hover:bg-muted hover:border-primary/30 transition-all cursor-pointer outline-none focus:ring-1 focus:ring-primary/20"
                            value={dealer?.id || ''}
                            onChange={(e) => {
                                const selected = DEALERS.find(d => d.id === e.target.value);
                                if (selected) setDealer(selected);
                            }}
                        >
                            {DEALERS.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Profile" className="w-8 h-8 rounded-full border border-gray-300" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                <UserIcon size={18} />
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-6 lg:overflow-hidden lg:h-full bg-background">
                <div className="max-w-7xl mx-auto h-auto lg:h-full grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

                    {/* Left Panel: CEM Finder */}
                    <section className="h-auto lg:h-full lg:overflow-y-auto">
                        <div className="bg-card text-card-foreground rounded-lg border p-6 h-full">
                            <h2 className="text-lg font-semibold mb-4 text-foreground">My Success Manager</h2>
                            <RealCEMFinder />
                        </div>
                    </section>

                    {/* Right Panel: Chat Interface */}
                    <section className="h-full min-h-[500px] flex flex-col lg:overflow-hidden">
                        <div className="bg-card rounded-lg border flex flex-col overflow-hidden h-full">
                            <RealChatInterface />
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
