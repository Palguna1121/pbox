import React from "react";

const PhotoboxDetail = async ({ params }: { params: { id: string } }) => {
  // You can now use await here if you need to fetch data
  // const data = await fetchPhotoboxData(params.id);
  // console.log(data);

  return (
    <div>
      <h1>Photobox</h1>
      <p>Photobox show {params.id}</p>
    </div>
  );
};

export default PhotoboxDetail;
