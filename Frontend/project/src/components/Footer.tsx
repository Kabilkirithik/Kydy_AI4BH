import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Twitter, Github, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <BrainCircuit size={20} />
              </div>
              <span className="font-bold text-xl">Kydy</span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-6">
              Kydy — Learn Smarter. Build Faster. Empowering learning & developer productivity with AI.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                <Twitter size={18} />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                <Github size={18} />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                <Linkedin size={18} />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Product</h3>
            <ul className="space-y-3">
              <li><Link to="/chat" className="text-sm text-muted-foreground hover:text-primary transition-colors">Chat Assistant</Link></li>
              <li><Link to="/animations" className="text-sm text-muted-foreground hover:text-primary transition-colors">SVG Animations</Link></li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Use Cases</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-3">
              <li><a href="mailto:hello@kydy.ai" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kydy AI. All rights reserved.
          </p>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>Email: <a href="mailto:hello@kydy.ai" className="hover:text-primary">hello@kydy.ai</a></span>
            <span className="px-2">|</span>
            <span>Web: <a href="https://www.kydy.ai" className="hover:text-primary">www.kydy.ai</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;