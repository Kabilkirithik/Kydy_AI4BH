import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function NotFound() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </Layout>
  );
}