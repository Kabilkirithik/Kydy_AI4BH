import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  ArrowRight, 
  Brain, 
  Code2, 
  LineChart, 
  Palette, 
  GraduationCap, 
  Target, 
  Lightbulb,
  CheckCircle2,
  Terminal,
  Cpu,
  Layers
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/20 -z-10" />
        
        {/* Abstract Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h1 
            initial="hidden" animate="visible" variants={fadeInUp}
            className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6"
          >
            Empowering Learning & Developer Productivity with AI
          </motion.h1>
          <motion.p 
            initial="hidden" animate="visible" variants={fadeInUp}
            className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto"
          >
            Kydy transforms how students learn and developers build — using intelligent automation, smart insights, and adaptive learning technologies.
          </motion.p>
          <motion.div 
            initial="hidden" animate="visible" variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/signin" className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium text-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
              Get Started <ArrowRight size={20} />
            </Link>
            <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground rounded-full font-medium text-lg hover:bg-secondary/80 transition-all border border-border">
              Explore Features
            </a>
          </motion.div>
        </div>
      </section>

      {/* About Us */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">📖 About Us</h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Brain size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Who We Are</h3>
              <p className="text-muted-foreground leading-relaxed">
                Kydy is an innovation-driven team focused on building AI-powered solutions that enhance learning experiences and boost developer productivity.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Target size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To simplify learning and accelerate development workflows through intelligent, accessible, and scalable AI tools.
              </p>
            </motion.div>
            
            <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Lightbulb size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                A future where AI assists every learner and developer to achieve more with less effort.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">🚀 Our Solution</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Empowering both sides of the digital spectrum with tailored AI tools.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Learning Card */}
            <motion.div 
              variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="p-8 md:p-10 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                  <GraduationCap size={28} />
                </div>
                <h3 className="text-2xl font-bold">AI for Learning</h3>
              </div>
              <p className="text-muted-foreground mb-8 text-lg">
                We provide adaptive learning tools that personalize education for each user.
              </p>
              <ul className="space-y-4">
                {[
                  "Personalized learning paths",
                  "Smart content recommendations",
                  "Real-time performance insights",
                  "Interactive SVG-based animations for better understanding"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground/80">
                    <CheckCircle2 size={20} className="text-primary mt-1 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Developer Card */}
            <motion.div 
              variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="p-8 md:p-10 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                  <Terminal size={28} />
                </div>
                <h3 className="text-2xl font-bold">AI for Developer Productivity</h3>
              </div>
              <p className="text-muted-foreground mb-8 text-lg">
                Kydy helps developers code smarter and faster.
              </p>
              <ul className="space-y-4">
                {[
                  "Intelligent code suggestions",
                  "Automated debugging assistance",
                  "Workflow optimization",
                  "Documentation generation"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground/80">
                    <CheckCircle2 size={20} className="text-primary mt-1 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">✨ Features</h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </motion.div>

          <motion.div 
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                icon: <Brain size={24} />,
                title: "🎯 Smart Learning Engine",
                desc: "AI analyzes user progress and adapts content accordingly."
              },
              {
                icon: <Code2 size={24} />,
                title: "⚡ Developer Assistant",
                desc: "Boost coding efficiency with intelligent automation."
              },
              {
                icon: <LineChart size={24} />,
                title: "📊 Analytics Dashboard",
                desc: "Track progress, performance, and productivity in real time."
              },
              {
                icon: <Palette size={24} />,
                title: "🎨 Interactive SVG Animations",
                desc: "Visual learning tools that make complex topics easy to understand."
              }
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-card p-6 rounded-2xl border border-border hover:-translate-y-1 transition-transform shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases & Tech Focus Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16">
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Layers className="text-primary" /> 🧩 Use Cases
              </h2>
              <div className="space-y-4">
                {[
                  "E-learning platforms",
                  "Coding bootcamps",
                  "Universities & training institutes",
                  "Developer teams & startups"
                ].map((useCase, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-medium text-foreground/80">{useCase}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: 0.2 }}>
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Cpu className="text-primary" /> 🛠️ Technology Focus
              </h2>
              <div className="flex flex-wrap gap-3">
                {[
                  "Artificial Intelligence & Machine Learning",
                  "Adaptive Learning Systems",
                  "SVG Animation for Interactive Education",
                  "Web-based Productivity Tools"
                ].map((tech, i) => (
                  <span key={i} className="px-5 py-3 rounded-full bg-primary/5 text-primary border border-primary/20 font-medium text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">📬 Contact Us</h2>
            <p className="text-primary-foreground/80 text-lg mb-10">
              Interested in collaborating or learning more? We'd love to hear from you.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="mailto:hello@kydy.ai" className="px-8 py-4 bg-background text-foreground rounded-xl font-semibold hover:bg-background/90 transition-colors flex items-center gap-3">
                📧 hello@kydy.ai
              </a>
              <a href="https://www.kydy.ai" className="px-8 py-4 bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl font-semibold hover:bg-primary-foreground/20 transition-colors flex items-center gap-3">
                🌐 www.kydy.ai
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </Layout>
  );
}