import React from "react";
import Link from "next/link";

const Photobox = () => {
  return (
    <div>
      <h1>Photobox Frame Catalog Admin</h1>
      <p>Frame Catalog admin index</p>
      <Link href="/admin/frame-catalog/create">Create</Link>
      <br />
      <Link href={`/admin/frame-catalog/${90}`}>Show</Link>
      <br />
      <Link href={`/admin/frame-catalog/${90}/edit`}>Edit</Link>
    </div>
  );
};

export default Photobox;
