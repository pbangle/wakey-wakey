import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Home, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";

import bunnySleepy from "./assets/bunny-sleepy.png";
import bunnyMid from "./assets/bunny-mid.png";
import bunnyAlmost from "./assets/bunny-almost.png";
import bunnyPrincess from "./assets/bunny-princess.png";

type Screen = "home" | "edit";

type Task = {
  id: string;
  title: string;
  selected: boolean;
  completed: boolean;
  kind: "default" | "custom";
};

type SavedState = {
  tasks: Task[];
};

type Stage = {
  image: string;
  title: string;
  subtitle: string;
  aura: string;
  glow: string;
  sparkles: boolean;
};

const STORAGE_KEY = "wakey-wakey-mobile-v2";

const defaultTaskLabels = [
  "Brush teeth",
  "Wash face",
  "Call Boyfriend",
  "Get dressed"
];

function buildDefaultTasks(): Task[] {
  return defaultTaskLabels.map((title, index) => ({
    id: `default-${index}`,
    title,
    selected: index < 4,
    completed: false,
    kind: "default",
  }));
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function getStage(completed: number, total: number): Stage {
  if (total === 0) {
    return {
      image: bunnySleepy,
      title: "No routine yet",
      subtitle: "Add a few tasks to begin.",
      aura: "from-rose-50 to-fuchsia-50",
      glow: "bg-pink-200/40",
      sparkles: false,
    };
  }

  const ratio = completed / total;

  if (ratio === 0) {
    return {
      image: bunnySleepy,
      title: "Sleepy bunny",
      subtitle: "Ready to start the morning.",
      aura: "from-rose-50 to-fuchsia-50",
      glow: "bg-pink-200/40",
      sparkles: false,
    };
  }

  if (ratio < 0.5) {
    return {
      image: bunnyMid,
      title: "Getting ready",
      subtitle: "Every task makes her glow up.",
      aura: "from-fuchsia-50 to-sky-50",
      glow: "bg-fuchsia-200/40",
      sparkles: true,
    };
  }

  if (ratio < 1) {
    return {
      image: bunnyAlmost,
      title: "Almost ready",
      subtitle: "She’s already looking extra cute.",
      aura: "from-pink-50 to-violet-50",
      glow: "bg-violet-200/40",
      sparkles: true,
    };
  }

  return {
    image: bunnyPrincess,
    title: "Princess ready",
    subtitle: "Everything is done for today.",
    aura: "from-yellow-50 to-pink-50",
    glow: "bg-yellow-200/50",
    sparkles: true,
  };
}

function NavButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-xs font-medium transition ${
        active ? "bg-white text-fuchsia-700 shadow-sm" : "text-zinc-500"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function CharacterSparkles({ visible }: { visible: boolean }) {
  if (!visible) return null;

  const sparkles = [
    { className: "left-3 top-7", delay: 0 },
    { className: "right-5 top-4", delay: 0.4 },
    { className: "left-7 bottom-6", delay: 0.8 },
    { className: "right-4 bottom-8", delay: 1.2 },
  ];

  return (
    <>
      {sparkles.map((sparkle, index) => (
        <motion.div
          key={index}
          className={`absolute ${sparkle.className} text-lg`}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.7, 1.15, 0.7],
            y: [0, -5, 0],
            rotate: [0, 12, -12, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: sparkle.delay,
          }}
        >
          ✨
        </motion.div>
      ))}
    </>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [tasks, setTasks] = useState<Task[]>(buildDefaultTasks());
  const [newTask, setNewTask] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        setHydrated(true);
        return;
      }

      const parsed = JSON.parse(raw) as SavedState;
      if (parsed?.tasks?.length) {
        setTasks(parsed.tasks);
      }
    } catch {
      // ignore storage errors in prototype
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      const payload: SavedState = { tasks };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage errors in prototype
    }
  }, [tasks, hydrated]);

  const selectedTasks = useMemo(
    () => tasks.filter((task) => task.selected),
    [tasks]
  );

  const completedTasks = useMemo(
    () => selectedTasks.filter((task) => task.completed),
    [selectedTasks]
  );

  const progress =
    selectedTasks.length === 0
      ? 0
      : Math.round((completedTasks.length / selectedTasks.length) * 100);

  const stage = getStage(completedTasks.length, selectedTasks.length);
  const customTasks = tasks.filter((task) => task.kind === "custom");

  function toggleTaskCompletion(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id && task.selected
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function toggleTaskSelection(id: string) {
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== id) return task;

        const nextSelected = !task.selected;

        return {
          ...task,
          selected: nextSelected,
          completed: nextSelected ? task.completed : false,
        };
      })
    );
  }

  function addCustomTask() {
    const title = newTask.trim();
    if (!title) return;

    setTasks((current) => [
      ...current,
      {
        id: makeId("custom"),
        title,
        selected: true,
        completed: false,
        kind: "custom",
      },
    ]);

    setNewTask("");
  }

  function removeTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function resetToday() {
    setTasks((current) =>
      current.map((task) => ({ ...task, completed: false }))
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-fuchsia-50 to-sky-50 text-zinc-800">
      <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col px-4 pb-28 pt-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-500">
              Wakey Wakey
            </div>
            <div className="text-lg font-bold">Soft morning routine</div>
          </div>

          {screen === "home" && selectedTasks.length > 0 && (
            <button
              type="button"
              onClick={resetToday}
              className="inline-flex items-center rounded-2xl border border-white/80 bg-white/90 px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-white"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </button>
          )}
        </div>

        {screen === "home" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-1 flex-col gap-4"
          >
            <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-lg">
              <div className={`bg-gradient-to-br ${stage.aura} p-6`}>
                <div className="text-center">
                  <div className="relative mx-auto grid h-40 w-40 place-items-center rounded-full bg-white/70 shadow-inner">
                    <motion.div
                      animate={{
                        scale: [1, 1.07, 1],
                        opacity: [0.45, 0.8, 0.45],
                      }}
                      transition={{
                        duration: 2.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className={`absolute h-24 w-24 rounded-full blur-2xl ${stage.glow}`}
                    />

                    <CharacterSparkles visible={stage.sparkles} />

                    <motion.div
                      animate={{
                        y: [0, -4, 0],
                        rotate: [0, -1.5, 1.5, 0],
                      }}
                      transition={{
                        duration: 4.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="relative z-10"
                    >
                      <img
                        src={stage.image}
                        alt={stage.title}
                        className="h-28 w-28 object-contain drop-shadow-lg"
                        draggable={false}
                      />
                    </motion.div>
                  </div>

                  <h1 className="mt-4 text-3xl font-black tracking-tight">
                    {stage.title}
                  </h1>
                  <p className="mt-1 text-sm text-zinc-500">{stage.subtitle}</p>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-sm text-zinc-500">
                    <span>Today</span>
                    <span>
                      {completedTasks.length} / {selectedTasks.length} done
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/70">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-pink-400 to-violet-400"
                      animate={{ width: `${progress}%` }}
                      transition={{ type: "spring", stiffness: 140, damping: 22 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {selectedTasks.length === 0 ? (
              <div className="rounded-[2rem] border border-white/80 bg-white/90 shadow-lg">
                <div className="space-y-4 p-5 text-center">
                  <div className="text-5xl">📝</div>
                  <p className="text-sm text-zinc-500">
                    You don’t have a routine yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setScreen("edit")}
                    className="h-12 w-full rounded-2xl bg-gradient-to-r from-pink-400 to-violet-400 font-bold text-white transition hover:opacity-95"
                  >
                    Create my routine
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedTasks.map((task, index) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`flex w-full items-center gap-4 rounded-[1.5rem] border p-4 text-left shadow-sm transition ${
                      task.completed
                        ? "border-fuchsia-200 bg-gradient-to-r from-rose-50 to-fuchsia-50"
                        : "border-white/80 bg-white/95"
                    }`}
                  >
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
                        task.completed
                          ? "bg-gradient-to-r from-pink-400 to-violet-400 text-white"
                          : "bg-zinc-100 text-zinc-400"
                      }`}
                    >
                      <Check className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Step {index + 1}
                      </div>
                      <div
                        className={`mt-1 text-base font-semibold ${
                          task.completed
                            ? "text-zinc-500 line-through"
                            : "text-zinc-800"
                        }`}
                      >
                        {task.title}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedTasks.length > 0 && progress === 100 && (
              <div className="rounded-[2rem] border border-white/80 bg-white/90 shadow-lg">
                <div className="p-5 text-center">
                  <div className="text-4xl">✨</div>
                  <div className="mt-2 text-lg font-bold">All done</div>
                  <div className="mt-1 text-sm text-zinc-500">
                    The bunny is fully ready.
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {screen === "edit" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-1 flex-col gap-4"
          >
            <div>
              <h2 className="text-2xl font-black tracking-tight">Edit routine</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Keep it short so it feels mobile and easy.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/80 bg-white/90 shadow-lg">
              <div className="p-4">
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-3 py-3"
                    >
                      <button
                        type="button"
                        onClick={() => toggleTaskSelection(task.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <div
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                            task.selected
                              ? "bg-gradient-to-r from-pink-400 to-violet-400 text-white"
                              : "bg-white text-zinc-300"
                          }`}
                        >
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="truncate font-medium">{task.title}</span>
                      </button>

                      {task.kind === "custom" && (
                        <button
                          type="button"
                          onClick={() => removeTask(task.id)}
                          className="grid h-9 w-9 place-items-center rounded-xl text-zinc-500 transition hover:bg-white"
                          aria-label={`Delete ${task.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/80 bg-white/90 shadow-lg">
              <div className="space-y-3 p-4">
                <div className="text-sm font-semibold text-zinc-700">
                  Add custom task
                </div>

                <div className="flex gap-2">
                  <input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addCustomTask();
                    }}
                    placeholder="Feed cat, sunscreen..."
                    className="h-11 flex-1 rounded-2xl border border-white/80 bg-white px-4 outline-none ring-0 placeholder:text-zinc-400 focus:border-fuchsia-200"
                  />

                  <button
                    type="button"
                    onClick={addCustomTask}
                    className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-r from-pink-400 to-violet-400 text-white transition hover:opacity-95"
                    aria-label="Add task"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {customTasks.length > 0 && (
                  <div className="text-xs text-zinc-500">
                    {customTasks.length} custom task
                    {customTasks.length > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <div className="fixed bottom-4 left-1/2 z-20 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 px-4">
          <div className="grid grid-cols-2 rounded-[2rem] border border-white/80 bg-white/80 p-2 shadow-xl backdrop-blur">
            <NavButton
              active={screen === "home"}
              label="Home"
              icon={<Home className="h-4 w-4" />}
              onClick={() => setScreen("home")}
            />
            <NavButton
              active={screen === "edit"}
              label="Edit"
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => setScreen("edit")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}