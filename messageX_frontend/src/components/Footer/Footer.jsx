import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <h3>MessageX</h3>

      <p>Connect • Communicate • Collaborate</p>

      <p>&copy; {new Date().getFullYear()} MessageX. All Rights Reserved.</p>
    </footer>
  );
};

export default Footer;
