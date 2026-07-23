import { Header } from '../../presentation/header';
import { Sidebar } from '../../presentation/sidebar';
import { Editor } from '../../presentation/editor';

export default function NotesPage() {
  return (
    <div className="flex flex-col h-screen bg-zinc-900">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Editor />
      </div>
    </div>
  );
}
