import { CodeBlock } from '../components/rxjs-playground/CodeBlock';
import {
  BEHAVIOR_SUBJECT_CODE,
  CONCAT_MERGE_CODE,
  CUSTOM_OPERATOR_CODE,
  HOT_COLD_CODE,
  MAPPING_OPERATORS_CODE,
  SUBJECT_CODE,
  SWITCHMAP_CODE,
  TAKEUNTIL_CODE,
  SCAN_CODE,
  DEBOUNCETIME_CODE,
  MERGE_CODE,
  THROTTLE_DEBOUNCE_CODE,
} from '../components/rxjs-playground/code-snippets';
import { BehaviorSubjectDemo } from '../components/rxjs-playground/BehaviorSubjectDemo';
import { SubjectDemo } from '../components/rxjs-playground/SubjectDemo';
import { SwitchMapDemo } from '../components/rxjs-playground/SwitchMapDemo';
import { TakeUntilDemo } from '../components/rxjs-playground/TakeUntilDemo';
import { ScanDemo } from '../components/rxjs-playground/ScanDemo';
import { DebounceTimeDemo } from '../components/rxjs-playground/DebounceTimeDemo';
import { MergeAndCombineLatestDemo } from '../components/rxjs-playground/MergeAndCombineLatestDemo';
import { HotColdDemo } from '../components/rxjs-playground/HotColdDemo';
import { MappingOperatorsDemo } from '../components/rxjs-playground/MappingOperatorsDemo';
import { ConcatMergeDemo } from '../components/rxjs-playground/ConcatMergeDemo';
import { ThrottleDebounceDemo } from '../components/rxjs-playground/ThrottleDebounceDemo';
import { CustomOperatorDemo } from '../components/rxjs-playground/CustomOperatorDemo';

export default async function RxjsPlaygroundPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-purple-400">
            RxJS Playground
          </h1>
          <p className="text-gray-500 text-sm">
            Każde demo: interaktywny przykład po lewej, kod źródłowy i live log
            po prawej.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
              1 — Fundament
            </h2>
            <SubjectDemo codeBlock={<CodeBlock code={SUBJECT_CODE} />} />
          </section>

          <section>
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
              2 — Hot vs cold observable
            </h2>
            <HotColdDemo codeBlock={<CodeBlock code={HOT_COLD_CODE} />} />
          </section>

          <section>
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
              3 — Subject z pamięcią stanu
            </h2>
            <BehaviorSubjectDemo
              codeBlock={<CodeBlock code={BEHAVIOR_SUBJECT_CODE} />}
            />
          </section>

          <section>
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
              4 — Zarządzanie race conditions
            </h2>
            <SwitchMapDemo codeBlock={<CodeBlock code={SWITCHMAP_CODE} />} />
          </section>

          <section>
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
              5 — Strategie mapowania inner Observable
            </h2>
            <MappingOperatorsDemo
              codeBlock={<CodeBlock code={MAPPING_OPERATORS_CODE} />}
            />
          </section>

          <section>
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
              6 — Anulowanie i cleanup
            </h2>
            <TakeUntilDemo codeBlock={<CodeBlock code={TAKEUNTIL_CODE} />} />
          </section>

          <section>
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
              7 — Akumulacja wartości
            </h2>
            <ScanDemo codeBlock={<CodeBlock code={SCAN_CODE} />} />
          </section>

          <section>
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
              8 — Kontrola częstotliwości
            </h2>
            <DebounceTimeDemo
              codeBlock={<CodeBlock code={DEBOUNCETIME_CODE} />}
            />
          </section>

          <section>
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
              9 — debounceTime kontra throttleTime
            </h2>
            <ThrottleDebounceDemo
              codeBlock={<CodeBlock code={THROTTLE_DEBOUNCE_CODE} />}
            />
          </section>

          <section>
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
              10 — Łączenie strumieni
            </h2>
            <MergeAndCombineLatestDemo
              codeBlock={<CodeBlock code={MERGE_CODE} />}
            />
          </section>

          <section>
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
              11 — concat kontra merge
            </h2>
            <ConcatMergeDemo
              codeBlock={<CodeBlock code={CONCAT_MERGE_CODE} />}
            />
          </section>

          <section>
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
              12 — Własne operatory
            </h2>
            <CustomOperatorDemo
              codeBlock={<CodeBlock code={CUSTOM_OPERATOR_CODE} />}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
