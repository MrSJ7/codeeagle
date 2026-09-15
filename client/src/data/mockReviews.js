export const PRESETS = [
  {
    id: 'insecure-login',
    name: 'Insecure Login',
    description: 'Express auth endpoint with SQL injection and hardcoded secret',
    code: `import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../database.js';

const router = express.Router();
const JWT_SECRET = 'super_secret_jwt_key_998822_do_not_share';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Unsafe query vulnerable to SQL injection
  const query = \`SELECT * FROM users WHERE email = '\${email}' AND password = '\${password}'\`;
  const user = await db.query(query);

  if (!user || user.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate token with hardcoded secret
  const token = jwt.sign({ id: user[0].id, role: user[0].role }, JWT_SECRET, {
    expiresIn: '7d'
  });

  res.json({ token, userId: user[0].id });
});

export default router;`
  },
  {
    id: 'buggy-react',
    name: 'Buggy React Component',
    description: 'React component with missing cleanup and stale effect dependencies',
    code: `import React, { useState, useEffect } from 'react';

export function UserActivityFeed({ userId }) {
  const [activities, setActivities] = useState([]);
  const [scrollPos, setScrollPos] = useState(0);

  // Missing cleanup function causes memory leak
  useEffect(() => {
    window.addEventListener('scroll', () => {
      setScrollPos(window.scrollY);
    });
  }, []);

  // Missing dependency in effect array
  useEffect(() => {
    fetch(\`/api/users/\${userId}/activity\`)
      .then(res => res.json())
      .then(data => setActivities(data));
  }, []);

  return (
    <div className="activity-feed">
      <h2>User Activity (Scroll: {scrollPos}px)</h2>
      <ul>
        {activities.map((act, index) => (
          <li key={index}>{act.action}</li>
        ))}
      </ul>
    </div>
  );
}`
  },
  {
    id: 'complex-function',
    name: 'Complex Function',
    description: 'Deeply nested control flow with excessive cyclomatic complexity',
    code: `export function calculateShippingFee(order, customer, coupon, location) {
  let fee = 25;

  // Deep nesting (Cyclomatic Complexity > 12)
  if (order && order.items && order.items.length > 0) {
    if (customer && customer.membershipTier) {
      if (customer.membershipTier === 'PLATINUM') {
        fee = 0;
      } else if (customer.membershipTier === 'GOLD') {
        if (order.totalAmount > 100) {
          fee = 0;
        } else {
          if (coupon && coupon.isValid) {
            fee = 5;
          } else {
            fee = 10;
          }
        }
      } else {
        if (location === 'DOMESTIC') {
          fee = 15;
        } else {
          fee = 35;
        }
      }
    } else {
      fee = 20;
    }
  }

  return fee;
}`
  }
];
