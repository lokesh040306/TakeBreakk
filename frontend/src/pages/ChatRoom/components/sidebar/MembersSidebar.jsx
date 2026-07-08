/**
 * MembersSidebar.jsx
 *
 * Desktop: always-visible right sidebar showing room members.
 * Mobile: bottom sheet triggered by tapping the member count in ChatHeader.
 *
 * Features:
 * - Colored avatar generated from username hash (consistent colors)
 * - Green online indicator dot on each member
 * - "you" label next to current user
 * - Owner can kick members via hover button
 */
import { FiX } from "react-icons/fi";
import { avatarColor } from "../../../../utils/helpers";

function MembersSidebar({ members, isOwner, currentUser, onKick, isOpen, onClose }) {
  return (
    <>
      {/* ── DESKTOP: always-visible right sidebar ── */}
      <aside
        className="hidden md:flex flex-col w-52 shrink-0 border-l"
        style={{
          borderColor: "var(--border-glass)",
          background: "var(--bg-glass)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <MemberList
          members={members}
          isOwner={isOwner}
          currentUser={currentUser}
          onKick={onKick}
          onClose={onClose}
        />
      </aside>

      {/* ── MOBILE: bottom sheet ── */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Dimmed backdrop — click to close */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Sheet panel slides up from bottom */}
          <div
            className="relative rounded-t-3xl max-h-[65vh] flex flex-col z-10 slide-up"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-glass)",
            }}
          >
            {/* Drag handle indicator */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: "var(--border-glass)" }} />
            </div>
            <MemberList
              members={members}
              isOwner={isOwner}
              currentUser={currentUser}
              onKick={onKick}
              onClose={onClose}
            />
          </div>
        </div>
      )}
    </>
  );
}

/** Inner list component — shared between desktop and mobile */
function MemberList({ members, isOwner, currentUser, onKick, onClose }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: "var(--border-glass)" }}
      >
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "var(--text-muted)" }}
        >
          Members · {members.length}
        </span>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-lg opacity-50 hover:opacity-100 transition"
        >
          <FiX size={14} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      {/* Scrollable member list */}
      <ul className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {members.map((m, idx) => {
          const isSelf = m.username === currentUser;
          const color = avatarColor(m.username);

          return (
            <li
              key={m.socketId}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition group fade-in"
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Avatar with online dot */}
                <div className="relative shrink-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md"
                    style={{ background: color }}
                  >
                    {m.username[0]?.toUpperCase()}
                  </div>
                  {/* Green online dot */}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2"
                    style={{ borderColor: "var(--bg-card)" }}
                  />
                </div>

                <div className="min-w-0">
                  <span
                    className="text-xs font-medium truncate block"
                    style={{ color: "var(--text)" }}
                  >
                    {m.username}
                  </span>
                  {isSelf && (
                    <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                      you
                    </span>
                  )}
                </div>
              </div>

              {/* Kick button — owner only, hidden until hover */}
              {isOwner && !isSelf && (
                <button
                  onClick={() => onKick(m.socketId)}
                  className="text-[10px] text-red-400 opacity-0 group-hover:opacity-100 transition hover:underline shrink-0 ml-2"
                >
                  Kick
                </button>
              )}
            </li>
          );
        })}

        {members.length === 0 && (
          <li className="text-[11px] text-center py-8" style={{ color: "var(--text-muted)" }}>
            No members yet
          </li>
        )}
      </ul>
    </div>
  );
}

export default MembersSidebar;
