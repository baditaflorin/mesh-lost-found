import { useEffect, useState } from "react";
import {
  MeshNameInput,
  useNamedPeer,
  type MeshConfig,
  type YRoom,
} from "@baditaflorin/mesh-common";
export type Listing = {
  id: string;
  kind: "lost" | "found";
  title: string;
  details: string;
  resolved: boolean;
  author: string;
};
export const validListing = (t: string, d: string) =>
  t.trim().length >= 3 && t.length <= 80 && d.trim().length >= 3 && d.length <= 300;
type Props = { room: YRoom | null; config: MeshConfig };
export function Feature({ room, config }: Props) {
  const named = useNamedPeer(config, room),
    [kind, setKind] = useState<"lost" | "found">("lost"),
    [title, setTitle] = useState(""),
    [details, setDetails] = useState(""),
    [rev, setRev] = useState(0);
  useEffect(() => {
    if (!room) return;
    const a = room.doc.getArray<Listing>("listings"),
      f = () => setRev((x) => x + 1);
    a.observe(f);
    return () => a.unobserve(f);
  }, [room]);
  void rev;
  const list = room?.doc.getArray<Listing>("listings").toArray() ?? [],
    add = () => {
      if (room && validListing(title, details)) {
        room.doc.getArray<Listing>("listings").push([
          {
            id: crypto.randomUUID(),
            kind,
            title: title.trim(),
            details: details.trim(),
            resolved: false,
            author: named.name || "Room member",
          },
        ]);
        setTitle("");
        setDetails("");
      }
    },
    resolve = (id: string) => {
      if (!room) return;
      const a = room.doc.getArray<Listing>("listings"),
        i = a.toArray().findIndex((x) => x.id === id);
      if (i >= 0) {
        const x = a.get(i);
        if (x) {
          a.delete(i, 1);
          a.insert(i, [{ ...x, resolved: true }]);
        }
      }
    };
  return (
    <main className="lost">
      <header>
        <p>Private room board</p>
        <h1>
          Lost something?
          <br />
          Let the room help.
        </h1>
        <span>No phone numbers or email addresses are collected here.</span>
      </header>
      <section className="form">
        <h2>Add a listing</h2>
        <select
          aria-label="Listing kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as "lost" | "found")}
        >
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
        <input
          aria-label="Item title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Item, color, or short label"
          maxLength={80}
        />
        <textarea
          aria-label="Item details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Where and when it was last seen — avoid contact details"
          maxLength={300}
        />
        <button onClick={add} disabled={!room || !validListing(title, details)}>
          Post to this room
        </button>
        <MeshNameInput
          label="Display name"
          value={named.name}
          onChange={named.setName}
          placeholder="Name in this room"
          maxLength={32}
          showCounter
        />
      </section>
      <section aria-live="polite">
        <h2>Room listings</h2>
        {list.length ? (
          <ol>
            {list.map((x) => (
              <li key={x.id}>
                <b>
                  {x.kind.toUpperCase()} · {x.title}
                </b>
                <p>{x.details}</p>
                <small>Posted by {x.author}</small>
                {!x.resolved && <button onClick={() => resolve(x.id)}>Mark resolved</button>}
              </li>
            ))}
          </ol>
        ) : (
          <p>No listings yet. Everything stays in this shared room.</p>
        )}
      </section>
    </main>
  );
}
