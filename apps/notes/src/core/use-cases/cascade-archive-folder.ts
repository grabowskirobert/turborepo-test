import type { NoteRepository } from '../ports/note-repository';
import type { FolderId } from '../../domain/types';

export async function cascadeArchiveFolder(
  repo: NoteRepository,
  folderId: FolderId,
): Promise<void> {
  await repo.archiveFolder(folderId);
}
