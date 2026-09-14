import { Mail, ExternalLink } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer__inner">
        <div className="footer__left">
          <span className="footer__brand">MIT-WPU FoundIt</span>
          <p className="footer__tagline">
            Securing campus assets through real-time directory matches and digital checkpoints.
          </p>
          <span className="footer__status">
            <span className="footer__status-dot" /> Live Portal Sync
          </span>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">Portal Links</h4>
          <nav className="footer__nav">
            <a href="/" className="footer__link">Home Directory</a>
            <a href="/how-it-works" className="footer__link">How It Works</a>
            <a href="/about" className="footer__link">About Portal</a>
            <a href="/login" className="footer__link">Student Dashboard</a>
          </nav>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">Connect with MIT-WPU</h4>
          <nav className="footer__socials">
            <a href="mailto:support.foundit@mitwpu.edu.in" className="footer__social-link" title="Email Support">
              <div className="footer__social-icon-wrapper mail">
                <Mail size={15} />
              </div>
              <span>support.foundit@mitwpu.edu.in</span>
            </a>
            <a href="https://www.instagram.com/mitwpuofficial/" target="_blank" rel="noopener noreferrer" className="footer__social-link" title="Instagram">
              <div className="footer__social-icon-wrapper instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </div>
              <span>@mitwpuofficial</span>
            </a>
            <a href="https://www.facebook.com/MITWPUPuneOfficial/" target="_blank" rel="noopener noreferrer" className="footer__social-link" title="Facebook">
              <div className="footer__social-icon-wrapper facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </div>
              <span>MITWPUPuneOfficial</span>
            </a>
            <a href="https://www.linkedin.com/school/mitwpuofficial/" target="_blank" rel="noopener noreferrer" className="footer__social-link" title="LinkedIn">
              <div className="footer__social-icon-wrapper linkedin">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </div>
              <span>MIT-WPU Pune</span>
            </a>
          </nav>
        </div>
      </div>
      
      <div className="footer__bottom">
        <div className="footer__bottom-inner">
          <p className="footer__copyright">
            &copy; {new Date().getFullYear()} MIT World Peace University, Pune. All Rights Reserved.
          </p>
          <a href="https://mitwpu.edu.in" target="_blank" rel="noopener noreferrer" className="footer__external">
            mitwpu.edu.in <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </footer>
  );
}
