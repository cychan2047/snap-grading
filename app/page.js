"use client";
import React, { useRef, useState } from 'react';
import { Upload, Loader2, Check, X } from 'lucide-react';
import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { prompt_grade, prompt_rubric } from "@/app/prompts";
import Image from 'next/image'
import Logo from '@/app/logo';
import Head from "next/head";

const totalPossiblePoints = 5;

export default function MathGradingDemo() {
  const [currentView, setCurrentView] = useState('upload');
  const [showRubrics, setShowRubrics] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [gradingResult, setGradingResult] = useState(null);
  const [rubricResult, setRubricResult] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState({
    rubric: 'pending',
    grade: 'pending'
  });

  const LoadingView = () => {
    const getStatusIcon = (status) => {
      switch (status) {
        case 'pending':
          return <Loader2 className="h-5 w-5 animate-spin text-blue-400" />;
        case 'success':
          return <Check className="h-5 w-5 text-green-400" />;
        case 'error':
          return <X className="h-5 w-5 text-red-400" />;
        default:
          return null;
      }
    };

    const getLoadingMessage = () => {
      if (loadingStatus.rubric === 'pending') {
        return "Generating rubric for your solution...";
      } else if (loadingStatus.grade === 'pending') {
        return "Grading your solution based on the rubric...";
      }
      return "Processing your image...";
    };

    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <p className="text-lg text-gray-300">{getLoadingMessage()}</p>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <span>Rubric Generation:</span>
            {getStatusIcon(loadingStatus.rubric)}
          </div>
          <div className="flex items-center space-x-2">
            <span>Grading:</span>
            {getStatusIcon(loadingStatus.grade)}
          </div>
        </div>
      </div>
    );
  };

  const UploadView = () => {
    const handleImageSelection = (event) => {
      const file = event.target.files[0];
      if (file) {
        setUploadedFile(file);

        // Convert file to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          // Remove the data URL prefix if present
          const base64String = reader.result.split(',')[1] || reader.result;
          setBase64Image(base64String);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleImageUpload = async () => {
      if (!uploadedFile) return;

      setCurrentView('loading');
      setLoadingStatus({ rubric: 'pending', grade: 'pending' });

      try {
        // Request to generate the rubric.
        const formDataRubricsRequest = new FormData();
        formDataRubricsRequest.append('image', base64Image);
        formDataRubricsRequest.append('prompt', prompt_rubric);

        const makeRubricResponse = await fetch('/api/rubric', {
          method: 'POST',
          body: formDataRubricsRequest,
        });
        const rubricResult = await makeRubricResponse.json();
        setRubricResult(rubricResult);
        setLoadingStatus((prev) => ({ ...prev, rubric: 'success' }));

        // Request to grade the solution.
        const formDataGradeRequest = new FormData();
        formDataGradeRequest.append('image', base64Image);
        formDataGradeRequest.append('prompt', prompt_grade);
        formDataGradeRequest.append('rubric', JSON.stringify(rubricResult));

        const makeGradeResponse = await fetch('/api/grade', {
          method: 'POST',
          body: formDataGradeRequest,
        });
        const gradeResult = await makeGradeResponse.json();

        setGradingResult(gradeResult);
        setLoadingStatus((prev) => ({ ...prev, grade: 'success' }));
        setCurrentView('result');
      } catch (error) {
        console.error('Error processing image upload:', error);
        setLoadingStatus({ rubric: 'error', grade: 'error' });
        setCurrentView('upload');
      }
    };

    return (
      <div className="space-y-8">
        <Logo/>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelection}
          accept="image/*"
          className="hidden"
        />

        {uploadedFile ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-72 h-72 flex items-center justify-center">
              <Image
                src={URL.createObjectURL(uploadedFile)}
                alt="Uploaded Image"
                className="max-w-full max-h-full object-contain rounded-md border border-gray-300"
              />
            </div>
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Picture
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
                onClick={handleImageUpload}
              >
                Upload
              </button>
            </div>
          </div>
        ) : (
          <div
            className="border-2 border-dashed rounded-lg p-12 bg-slate-700 cursor-pointer hover:bg-slate-600 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center space-y-4">
              <Upload className="h-12 w-12 text-gray-400"/>
              <p className="text-lg text-center text-gray-300">
                Click to upload image.
                <br/>
                When finish uploading, the system sends the picture to LLM.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ResultView = () => {
    if (!gradingResult) {
      return (
          <div className="text-center">
            <p className="text-lg text-gray-300">No result available. Please try again.</p>
          </div>
      );
    }

    return (
      <div className="space-y-8">
        <Logo/>

        {/* Uploaded Image */}
        <div className="flex justify-center mb-6">
          <div className="w-72 h-72 flex items-center justify-center">
            <Image
              src={URL.createObjectURL(uploadedFile)}
              alt="Uploaded Solution"
              className="max-w-full max-h-full object-contain rounded-md border border-gray-300"
            />
          </div>
        </div>

        {/* Results Column */}
        <div className="space-y-6">
        <div className={`border rounded-lg p-6 ${gradingResult.final_score === totalPossiblePoints ? 'bg-green-800' : 'bg-red-800'}`}>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-green-300">
              Grading Result
            </h2>
            <p className="text-lg text-green-200">
              Final Score: {gradingResult.final_score} / {totalPossiblePoints}
            </p>
          </div>
        </div>

        {/* Detailed Steps Evaluation */}
        <div className="border rounded-lg p-6 bg-slate-700 space-y-4">
          <h3 className="text-lg font-semibold text-gray-200">Step-by-Step Evaluation</h3>
          {gradingResult.steps_and_correctness?.map((step, index) => (
            <div key={index} className="space-y-2 border-b border-slate-600 pb-3">
              <div className="flex justify-between items-center">
                <p className="text-lg text-gray-200">Step {index + 1}</p>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    step.correctness ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}
                >
              {step.correctness ? 'Correct' : 'Incorrect'}
            </span>
              </div>
              <p className="text-gray-400">Expression: {step.step_expression}</p>
              <p className="text-gray-400">Points Earned: {step.grade}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            onClick={() => setShowRubrics(true)}
            className="px-4 py-2 border rounded-lg text-gray-200 bg-slate-600 hover:bg-slate-500 transition-colors"
          >
            Check Rubrics
          </Button>
          <button
            onClick={() => setCurrentView('upload')}
            className="px-4 py-2 border rounded-lg text-gray-200 bg-slate-600 hover:bg-slate-500 transition-colors flex items-center space-x-2"
          >
            <span>Grade Another Answer</span>
          </button>
        </div>
      </div>
    </div>
    )
  };

  const RubricsModal = () => (
      <Dialog
          open={showRubrics}
          as="div"
          className="relative z-10 focus:outline-none"
          onClose={() => setShowRubrics(false)}
      >
        <div className="fixed inset-0 z-10 w-screen bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="w-full max-w-md rounded-xl bg-slate-700 p-6">
              <DialogTitle as="h3" className="text-lg font-medium text-gray-200">
                Grading Rubrics
              </DialogTitle>
              <div className="space-y-4 p-4 text-gray-300">
                {rubricResult?.rubrics?.map((rubric, index) => (
                    <div key={index} className="space-y-2 border-b border-slate-600 pb-3">
                      <p className="text-lg text-gray-200">{rubric.description}</p>
                      <p className="text-gray-400">{rubric.expression}</p>
                      <p className="text-gray-400">Total Points: {rubric.total_points}</p>
                    </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                    onClick={() => setShowRubrics(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
  );

  const DemoControls = () => (
    <div className="mt-8 p-4 border-t border-gray-600" hidden>
      <p className="mb-4 text-sm text-gray-400">Demo Controls:</p>
      <div className="space-x-4">
        <button
          onClick={() => setCurrentView('upload')}
          className="px-3 py-1 text-sm border rounded-full text-gray-300 bg-slate-700 hover:bg-slate-600"
        >
          Show Upload
        </button>
        <button
          onClick={() => setCurrentView('loading')}
          className="px-3 py-1 text-sm border rounded-full text-gray-300 bg-slate-700 hover:bg-slate-600"
        >
          Show Loading
        </button>
        <button
          onClick={() => setCurrentView('result')}
          className="px-3 py-1 text-sm border rounded-full text-gray-300 bg-slate-700 hover:bg-slate-600"
        >
          Show Result
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 p-8">
      <div className="max-w-3xl mx-auto">
        {currentView === 'upload' && <UploadView/>}
        {currentView === 'loading' && <LoadingView/>}
        {currentView === 'result' && <ResultView/>}
        <RubricsModal/>
        <DemoControls/>
      </div>
    </div>
  );
}
