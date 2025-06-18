import 'bootstrap/dist/css/bootstrap.min.css';

const AboutUs = () => {
  return (
    <section className="bg-light py-5">
      <div className="container">
        <h2 className="text-center mb-4">About Us</h2>
        <p>
          <strong>File Conversion Service</strong> is a comprehensive platform designed to streamline the process of converting various types of files efficiently and effectively. Built with a modern tech stack including Node.js, Express.js, MongoDB, React, and Stripe, this application offers a seamless experience for users to manage their file conversion needs.
        </p>
        <p>
          Our mission is to provide a reliable and user-friendly service that meets the diverse needs of our customers. Whether you need to convert documents, images, or multimedia files, our platform is equipped to handle it all with ease.
        </p>
        <p>
          We are committed to continuous improvement and innovation, ensuring that our users always have access to the latest and most efficient file conversion tools. Thank you for choosing File Conversion Service.
        </p>
      </div>
    </section>
  );
};

export default AboutUs;
