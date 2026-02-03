import React, { useEffect, useState } from "react";
import type { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";
import SearchBar from "./SearchBar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Props = {
  users?: User[]; // ✅ optional + default
  loading?: boolean; // ✅ optional
};

type ExtendedUser = User & {
  requestPending: boolean;
  isRequestReceived: boolean;
  isFriend: boolean;
  image: string;
};

const glass =
  "bg-[rgba(18,18,18,0.86)] backdrop-blur-md border border-white/10 rounded-2xl";
const chip =
  "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold text-white/90 bg-white/10 border border-white/10";
const btnBase =
  "rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-95";
const btnGhost = `${btnBase} text-white/90 bg-white/10 border border-white/10 hover:bg-white/15`;
const listWrap = "max-h-[60vh] overflow-y-auto pr-1 custom-scroll";
const nameBtn =
  "truncate text-left font-semibold text-white hover:underline focus:outline-none focus:underline";

const FriendList: React.FC<Props> = ({ users = [] }) => {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const meId = sessionData?.user?.id ?? null;

  // ✅ initialize safely (users may be empty on first SSR render)
  const [userList, setUserList] = useState<ExtendedUser[]>(
    (users ?? []).map((u) => ({
      ...u,
      requestPending: false,
      isRequestReceived: false,
      isFriend: false,
      image: u.image || "/default-userimage.png",
    })),
  );

  // when `users` prop changes (after fetch), rebuild local state
  useEffect(() => {
    const base = (users ?? []).map((u) => ({
      ...u,
      requestPending: false,
      isRequestReceived: false,
      isFriend: false,
      image: u.image || "/default-userimage.png",
    }));
    setUserList(base);
  }, [users]);

  const fetchUserData = async () => {
    if (!meId) return;
    try {
      const [sentRes, recvRes, friendsRes] = await Promise.all([
        fetch(`/api/viewPendingRequests?userId=${meId}`),
        fetch(`/api/viewFriendRequests?userId=${meId}`),
        fetch(`/api/findMyFriendships?userId=${meId}`),
      ]);

      const [sent, received, friendships] = await Promise.all([
        sentRes.ok ? sentRes.json() : [],
        recvRes.ok ? recvRes.json() : [],
        friendsRes.ok ? friendsRes.json() : [],
      ]);

      const friendIds = new Set<string>(
        friendships.map((f: any) =>
          f.userId === meId ? f.friendId : f.userId,
        ),
      );

      const decorated = (users ?? []).map((u) => ({
        ...u,
        requestPending: sent.some((r: any) => r.receiverId === u.id),
        isRequestReceived: received.some((r: any) => r.senderId === u.id),
        isFriend: friendIds.has(u.id),
        image: u.image || "/default-userimage.png",
      }));

      setUserList(decorated);
    } catch (e) {
      console.error("Error fetching user data:", e);
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meId, users]);

  const handleUserClick = (userId: string) => router.push(`/profile/${userId}`);

  // actions
  const onAddFriend = async (userId: string) => {
    if (!meId) return;
    try {
      const res = await fetch("/api/sendFriendRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: meId, receiverId: userId }),
      });
      if (res.ok) {
        toast.success("Friend request sent");
        await fetchUserData();
      } else toast.error("Failed to send friend request");
    } catch (e) {
      console.error(e);
      toast.error("Error sending friend request");
    }
  };

  const acceptFriendRequest = async (senderId: string) => {
    if (!meId) return;
    try {
      const res = await fetch("/api/acceptFriendRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId, receiverId: meId }),
      });
      if (res.ok) {
        toast.success("Friend request accepted");
        await fetchUserData();
      } else toast.error("Failed to accept friend request");
    } catch (e) {
      console.error(e);
      toast.error("Error accepting friend request");
    }
  };

  const rejectFriendRequest = async (senderId: string) => {
    if (!meId) return;
    try {
      const res = await fetch("/api/declineFriendRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId, receiverId: meId }),
      });
      if (res.ok) {
        toast.success("Friend request declined");
        await fetchUserData();
      } else toast.error("Failed to decline friend request");
    } catch (e) {
      console.error(e);
      toast.error("Error declining friend request");
    }
  };

  const Badge = ({ kind }: { kind: "friend" | "requested" | "incoming" }) => {
    const base = `${chip}`;
    if (kind === "friend")
      return (
        <span
          className={`${base} border-green-300/20 bg-green-400/10 text-green-300`}
        >
          Friend
        </span>
      );
    if (kind === "requested")
      return (
        <span
          className={`${base} border-amber-300/20 bg-amber-400/10 text-amber-300`}
        >
          Requested
        </span>
      );
    return (
      <span className={`${base} border-sky-300/20 bg-sky-400/10 text-sky-300`}>
        Request
      </span>
    );
  };

  const Row = (u: ExtendedUser, right?: React.ReactNode) => (
    <li key={u.id} className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleUserClick(u.id)}
          className="shrink-0 overflow-hidden rounded-full border border-white/20"
          aria-label={`Open profile of ${u.name ?? "user"}`}
        >
          <Image
            src={u.image || "/default-userimage.png"}
            alt={`${u.name ?? "User"} avatar`}
            width={44}
            height={44}
            className="h-11 w-11 object-cover"
          />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUserClick(u.id)}
              title={u.name ?? ""}
              className={nameBtn}
            >
              {u.name ?? "Unknown user"}
            </button>
            {u.isFriend ? (
              <Badge kind="friend" />
            ) : u.requestPending ? (
              <Badge kind="requested" />
            ) : u.isRequestReceived ? (
              <Badge kind="incoming" />
            ) : null}
            {u.isAdmin && (
              <span
                className={`${chip} border-violet-300/20 bg-violet-400/10 text-violet-200`}
              >
                Admin
              </span>
            )}
          </div>
        </div>

        {right}
      </div>
    </li>
  );

  // Sections
  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <section className={`${glass} p-5 sm:p-6`}>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className={listWrap}>{children}</div>
    </section>
  );

  // Derived lists
  const friends = userList.filter((u) => u.isFriend);
  const incoming = userList.filter((u) => u.isRequestReceived && !u.isFriend);
  const sent = userList.filter((u) => u.requestPending);

  // Search list
  const [searchList, setSearchList] = useState<ExtendedUser[]>(userList);
  useEffect(() => setSearchList(userList), [userList]);
  const onSearch = (term: string) => {
    const t = term.trim().toLowerCase();
    setSearchList(
      !t
        ? userList
        : userList.filter((u) => (u.name || "").toLowerCase().includes(t)),
    );
  };

  return (
    <div>
      <ToastContainer />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Friends">
          {friends.length ? (
            <ul className="divide-y divide-white/5">
              {friends.map((u) =>
                Row(
                  u,
                  meId !== u.id ? (
                    <button
                      disabled
                      className="bg-green-400/15 rounded-xl border border-green-300/20 px-3 py-1.5 text-xs font-semibold text-green-300"
                    >
                      Friends
                    </button>
                  ) : null,
                ),
              )}
            </ul>
          ) : (
            <div className="border-white/12 rounded-xl border border-dashed p-8 text-center text-white/70">
              No friends yet.
            </div>
          )}
        </Section>

        <Section title="Pending Friend Requests">
          {incoming.length ? (
            <ul className="divide-y divide-white/5">
              {incoming.map((u) =>
                Row(
                  u,
                  <div className="flex gap-2">
                    <button
                      className={btnGhost + " hover:text-green-400"}
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptFriendRequest(u.id);
                      }}
                    >
                      Accept
                    </button>
                    <button
                      className={btnGhost + " hover:text-red-400"}
                      onClick={(e) => {
                        e.stopPropagation();
                        rejectFriendRequest(u.id);
                      }}
                    >
                      Reject
                    </button>
                  </div>,
                ),
              )}
            </ul>
          ) : (
            <div className="border-white/12 rounded-xl border border-dashed p-8 text-center text-white/70">
              No pending requests.
            </div>
          )}
        </Section>

        <Section title="Sent Requests">
          {sent.length ? (
            <ul className="divide-y divide-white/5">
              {sent.map((u) =>
                Row(
                  u,
                  <button
                    disabled
                    className="border-white/15 rounded-xl border bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/70"
                  >
                    Pending
                  </button>,
                ),
              )}
            </ul>
          ) : (
            <div className="border-white/12 rounded-xl border border-dashed p-8 text-center text-white/70">
              No sent requests.
            </div>
          )}
        </Section>

        <section className={`${glass} p-5 sm:p-6 lg:col-span-2`}>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-white">Users</h2>
            <div className="sm:w-80">
              <SearchBar onSearch={onSearch} />
            </div>
          </div>

          <div className={listWrap}>
            <ul className="divide-y divide-white/5">
              {searchList.map((u) => {
                const canAdd =
                  !u.isFriend &&
                  !u.requestPending &&
                  !u.isRequestReceived &&
                  meId !== u.id;
                return Row(
                  u,
                  canAdd ? (
                    <button
                      className={btnGhost + " hover:text-yellow-400"}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddFriend(u.id);
                      }}
                    >
                      Add
                    </button>
                  ) : null,
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FriendList;
