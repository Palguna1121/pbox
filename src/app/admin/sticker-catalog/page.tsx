import React from "react";
import Link from "next/link";

const Sticker = () => {
  return (
    <div>
      <h1>Sticker Catalog Admin</h1>
      <p>Sticker Catalog admin index</p>
      <Link href="/admin/sticker-catalog/create">Create</Link>
      <br />
      <Link href={`/admin/sticker-catalog/${90}`}>Show</Link>
      <br />
      <Link href={`/admin/sticker-catalog/${90}/edit`}>Edit</Link>
    </div>
  );
};

export default Sticker;
