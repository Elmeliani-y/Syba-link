import React from 'react'
import { Link } from 'react-router-dom'
export default function Route() {
  return (
    <div>
      <nav>
        <Link to="/login">login</Link>
        <Link to="/signup">signup</Link>
      </nav>
    </div>
  );
}
