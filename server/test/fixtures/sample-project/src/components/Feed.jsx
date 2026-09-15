import React, { useEffect, useState } from 'react';

export function Feed({ userId }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`/api/posts?user=${userId}`)
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, []);

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
