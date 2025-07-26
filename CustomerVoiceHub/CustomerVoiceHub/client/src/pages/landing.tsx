import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Star, PlayCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 shadow-sm bg-white">
        <h1 className="text-2xl font-bold text-blue-700">FeedbackFlow</h1>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => window.location.href = '/api/login'}
        >
          Get Started
        </Button>
      </header>

      {/* Hero Section */}
      <section className="text-center py-24 px-6 max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold text-gray-900 mb-4"
        >
          Collect Customer Feedback
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl font-bold text-blue-600 mb-6"
        >
          Like Never Before
        </motion.p>
        <p className="text-gray-600 text-lg mb-8">
          Generate QR codes for your stores and let customers share their experience
          through video, audio, or text with our friendly AI avatar.
        </p>
        <div className="flex justify-center gap-4">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Start Free Trial
          </Button>
          <Button variant="outline" className="text-slate-700 border-slate-300 hover:bg-slate-50 px-6 py-2 text-lg">
            <PlayCircle className="w-5 h-5 mr-2" /> Watch Demo
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 px-6">
        <h3 className="text-center text-3xl font-semibold text-gray-900 mb-12">
          Everything You Need to Understand Your Customers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card 
            className="shadow-md rounded-2xl hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => window.location.href = '/api/login'}
          >
            <CardContent className="p-6 text-center">
              <h4 className="text-xl font-bold mb-2">QR Code Generator</h4>
              <p className="text-gray-600">Easily create branded QR codes for in-store or digital collection.</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                Try It Now
              </Button>
            </CardContent>
          </Card>
          <Card 
            className="shadow-md rounded-2xl hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => window.location.href = '/feedback/demo'}
          >
            <CardContent className="p-6 text-center">
              <h4 className="text-xl font-bold mb-2">AI Avatar Collection</h4>
              <p className="text-gray-600">Let users leave feedback with text, voice, or video with an AI guide.</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                See Demo
              </Button>
            </CardContent>
          </Card>
          <Card 
            className="shadow-md rounded-2xl hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => window.location.href = '/api/login'}
          >
            <CardContent className="p-6 text-center">
              <h4 className="text-xl font-bold mb-2">Insight Dashboard</h4>
              <p className="text-gray-600">Track sentiment, identify issues, and act fast with visual analytics.</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                View Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
