
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';

function App() {
    const { isLoading } = useAuth();

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#666' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '1rem' }}>Loading Virtual Performance Manager...</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Authenticating...</div>
                </div>
            </div>
        );
    }

    return <Home />;
}

export default App;
