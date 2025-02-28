import React, { useEffect, useState } from "react";

const PhotoboxEdit = ({ params }: { params: { id: string } }) => {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Simulating async operation to fetch data
      const data = await Promise.resolve(params.id);
      setId(data);
    };
    fetchData();
  }, [params.id]);

  return (
    <div>
      <h1>Photobox</h1>
      {id ? <p>Photobox edit {id}</p> : <p>Loading...</p>}
    </div>
  );
};

export default PhotoboxEdit;

