import React from "react";

const NoFriendsFound = () => {
  return (
    <div className="card bg-base-200 border border-base-content/20 rounded-xl p-6 text-center">
      <h3 className="font-semibold text-xs mb-2">No connections found</h3>
      <p className="text-xs opacity-70">
        You havent connected with anyone yet. Find colleagues below to get
        started.
      </p>
    </div>
  );
};

export default NoFriendsFound;
