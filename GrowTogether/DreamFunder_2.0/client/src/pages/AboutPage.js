import React from "react";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function AboutPage() {
  const navigate = useNavigate();
  return (
    <>
      <div className="min-h-screen bg-gray-800 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            About DreamFunder
          </h1>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Our Project</h2>
            <p className="text-gray-300 mb-4">
              DreamFunder is a decentralized crowdfunding platform built on
              blockchain technology. Our mission is to empower dreamers,
              innovators, and changemakers by providing a transparent, secure,
              and accessible way to fund their projects.
            </p>
            <p className="text-gray-300 mb-4">
              Leveraging the power of smart contracts and cryptocurrency,
              DreamFunder ensures that every transaction is recorded on the
              blockchain, providing unparalleled transparency and trust in the
              crowdfunding process.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
            <p className="text-gray-300 mb-4">
              We envision a world where great ideas are not limited by
              traditional funding barriers. DreamFunder aims to democratize the
              funding process, allowing innovative projects from all corners of
              the globe to find the support they need to thrive.
            </p>
            <p className="text-gray-300 mb-4">
              Our platform is designed to foster a community of creators and
              supporters, united in their passion for bringing transformative
              ideas to life.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Decentralized and transparent funding process</li>
              <li>Smart contract-based campaign creation and management</li>
              <li>Secure cryptocurrency transactions</li>
              <li>Community-driven project support and engagement</li>
              <li>Low fees compared to traditional crowdfunding platforms</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Meet the Creator</h2>
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-medium mb-2">Prabesh Tandukar</h3>
              <p className="text-gray-300 mb-4">
                I am currently a student of Master's of software engineering in
                Yoobee college. This is a project for my final semester. I
                aspires to become a good software engineer.
              </p>
              <p className="text-gray-300 mb-4">
                I want this platform to open a door for people who have vision
                and dream for a project that they are passionate about but lack
                the funding.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  LinkedIn
                </a>
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  GitHub
                </a>
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  Twitter
                </a>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Get Involved</h2>
            <p className="text-gray-300 mb-4">
              We're always looking for passionate individuals to join our
              community. Whether you're a creator with a groundbreaking idea, a
              supporter looking to back innovative projects, or a developer
              interested in contributing to our platform, there's a place for
              you in the DreamFunder ecosystem.
            </p>
          </section>
          <section className="text-center mb-12">
            <button
              onClick={() => navigate("/campaigns")}
              className="inline-block border border-blue-400 text-blue-400 font-semibold py-2 px-4 rounded hover:bg-blue-400 hover:text-gray-900 transition duration-300"
            >
              Join DreamFunder
            </button>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AboutPage;
