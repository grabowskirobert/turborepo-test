import type { NoteRepository } from '../ports/note-repository';
import type { FolderId } from '../../domain/types';

export async function restoreFolder(
  repo: NoteRepository,
  folderId: FolderId,
): Promise<void> {
  await repo.restoreFolder(folderId);
}
