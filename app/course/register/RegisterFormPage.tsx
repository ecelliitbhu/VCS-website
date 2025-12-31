"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ExistingData {
  full_name?: string;
  institution?: string;
  current_year?: string;
  course?: string;
  branch?: string;
  phone_number?: string;
  registered_course_id?: string;
}

interface RegisterFormPageProps {
  existingData?: ExistingData | null;
}

export default function RegisterFormPage({ existingData }: RegisterFormPageProps) {
  const isEditing = !!existingData?.registered_course_id;
  
  const [formData, setFormData] = useState({
    full_name: existingData?.full_name || "",
    institution: existingData?.institution || "",
    current_year: existingData?.current_year || "",
    current_year_other: "",
    course: existingData?.course || "",
    course_other: "",
    branch: existingData?.branch || "",
    branch_other: "",
    phone_number: existingData?.phone_number || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors("");

    // Validate phone number
    if (formData.phone_number.length !== 10) {
      setErrors("Phone number must be exactly 10 digits");
      return;
    }

    // Validate "Other" fields
    if (
      formData.current_year === "Other" &&
      !formData.current_year_other.trim()
    ) {
      setErrors("Please specify your current year");
      return;
    }
    if (formData.course === "Other" && !formData.course_other.trim()) {
      setErrors("Please specify your course");
      return;
    }
    if (formData.branch === "Other" && !formData.branch_other.trim()) {
      setErrors("Please specify your branch");
      return;
    }

    setSubmitting(true);

    const submissionData = {
      full_name: formData.full_name,
      institution: formData.institution,
      phone_number: formData.phone_number,
      course_id: "vc-course-iit-bhu-2025",
      current_year:
        formData.current_year === "Other"
          ? formData.current_year_other
          : formData.current_year,
      course:
        formData.course === "Other" ? formData.course_other : formData.course,
      branch:
        formData.branch === "Other" ? formData.branch_other : formData.branch,
    };

    try {
      const res = await fetch("/api/course/register", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
        // If editing, redirect back to course after short delay
        if (isEditing) {
          setTimeout(() => {
            router.push("/course");
          }, 2000);
        }
      } else {
        setErrors(
          "Registration failed: " + (data?.error || "Unknown error occurred")
        );
      }
    } catch (err) {
      console.error(err);
      setErrors("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone_number") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors) setErrors("");
  };

  const handleWhatsAppClick = () => {
    setTimeout(() => {
      router.push("/course");
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 hero-background">
      <div className="max-w-md w-full bg-card/80 backdrop-blur-md border border-border rounded-lg p-8 shadow-lg">
        {isSuccess ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              {isEditing ? "Profile Updated Successfully!" : "Registration Successful!"}
            </h1>
            {isEditing ? (
              <p className="mb-6">
                Your profile has been updated. Redirecting you back to the course...
              </p>
            ) : (
              <>
                <p className="mb-6">
                  Welcome! Please join the official WhatsApp group to get all the
                  updates and course materials.
                </p>
                <a
                  href="https://chat.whatsapp.com/FKpfFAEdb001JPVIeDh1J0?mode=wwt"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsAppClick}
                >
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                    Join Now (WhatsApp)
                  </Button>
                </a>
              </>
            )}
          </div>
        ) : (
          <>
            <h1 className="text-3xl text-cyan-200 font-bold mb-6 text-center pb-2">
              {isEditing ? "Update Profile" : "Course Registration"}
            </h1>

            {errors && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errors}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  required
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Institution *
                </label>
                <input
                  type="text"
                  name="institution"
                  required
                  placeholder="Enter your institute"
                  value={formData.institution}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Current Year *
                </label>
                <select
                  name="current_year"
                  required
                  value={formData.current_year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded bg-background"
                >
                  <option value="" disabled>
                    Select Year
                  </option>
                  <option className="text-black" value="1st Year">
                    1st Year
                  </option>
                  <option className="text-black" value="2nd Year">
                    2nd Year
                  </option>
                  <option className="text-black" value="3rd Year">
                    3rd Year
                  </option>
                  <option className="text-black" value="4th Year">
                    4th Year
                  </option>
                  <option className="text-black" value="5th Year">
                    5th Year
                  </option>
                  <option className="text-black" value="Postgraduate">
                    Postgraduate
                  </option>
                  <option className="text-black" value="Other">
                    Other
                  </option>
                </select>
              </div>

              {formData.current_year === "Other" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Please Specify Year *
                  </label>
                  <input
                    type="text"
                    name="current_year_other"
                    required
                    value={formData.current_year_other}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded bg-background"
                    placeholder="e.g., Alumni, Pre-University"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Course *
                </label>
                <select
                  name="course"
                  required
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded bg-background"
                >
                  <option value="" disabled>
                    Select Course
                  </option>
                  <option className="text-black" value="B.Tech">
                    B.Tech
                  </option>
                  <option className="text-black" value="M.Tech">
                    M.Tech
                  </option>
                  <option className="text-black" value="MBA">
                    MBA
                  </option>
                  <option className="text-black" value="B.S.">
                    B.S. (Bachelor of Science)
                  </option>
                  <option className="text-black" value="B.Sc">
                    B.Sc
                  </option>
                  <option className="text-black" value="M.Sc">
                    M.Sc
                  </option>
                  <option
                    className="text-black"
                    value="Dual Degree (B.Tech + M.Tech)"
                  >
                    Dual Degree (B.Tech + M.Tech)
                  </option>
                  <option
                    className="text-black"
                    value="Integrated (B.Sc + M.Sc)"
                  >
                    Integrated (B.Sc + M.Sc)
                  </option>
                  <option className="text-black" value="Ph.D">
                    Ph.D
                  </option>
                  <option className="text-black" value="Other">
                    Other
                  </option>
                </select>
              </div>

              {formData.course === "Other" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Please Specify Course *
                  </label>
                  <input
                    type="text"
                    name="course_other"
                    required
                    value={formData.course_other}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded bg-background"
                    placeholder="e.g., BBA, BCA"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Branch *
                </label>
                <select
                  name="branch"
                  required
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded bg-background"
                >
                  <option value="" disabled>
                    Select Branch
                  </option>
                  <option
                    className="text-black"
                    value="Computer Science & Engineering"
                  >
                    Computer Science & Engineering
                  </option>
                  <option className="text-black" value="Electrical Engineering">
                    Electrical Engineering
                  </option>
                  <option className="text-black" value="Mechanical Engineering">
                    Mechanical Engineering
                  </option>
                  <option className="text-black" value="Chemical Engineering">
                    Chemical Engineering
                  </option>
                  <option className="text-black" value="Civil Engineering">
                    Civil Engineering
                  </option>
                  <option className="text-black" value="Aerospace Engineering">
                    Aerospace Engineering
                  </option>
                  <option
                    className="text-black"
                    value="Metallurgical & Materials Engineering"
                  >
                    Metallurgical & Materials Engineering
                  </option>
                  <option className="text-black" value="Biotechnology">
                    Biotechnology
                  </option>
                  <option className="text-black" value="Engineering Physics">
                    Engineering Physics
                  </option>
                  <option
                    className="text-black"
                    value="Mathematics & Computing"
                  >
                    Mathematics & Computing
                  </option>
                  <option className="text-black" value="Finance">
                    Finance
                  </option>
                  <option className="text-black" value="Marketing">
                    Marketing
                  </option>
                  <option className="text-black" value="Operations">
                    Operations
                  </option>
                  <option className="text-black" value="Human Resources">
                    Human Resources
                  </option>
                  <option className="text-black" value="Analytics">
                    Analytics
                  </option>
                  <option className="text-black" value="Physics">
                    Physics
                  </option>
                  <option className="text-black" value="Chemistry">
                    Chemistry
                  </option>
                  <option className="text-black" value="Mathematics">
                    Mathematics
                  </option>
                  <option className="text-black" value="Other">
                    Other
                  </option>
                </select>
              </div>

              {formData.branch === "Other" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Please Specify Branch *
                  </label>
                  <input
                    type="text"
                    name="branch_other"
                    required
                    value={formData.branch_other}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded bg-background"
                    placeholder="e.g., Data Science, AI & ML"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  required
                  placeholder="9876543210"
                  value={formData.phone_number}
                  onChange={handleChange}
                  minLength={10}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className="w-full px-3 py-2 border border-border rounded bg-background"
                />
              </div>

              <div className="flex justify-center w-full pt-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  variant="default"
                  size="lg"
                  className="w-full max-w-sm"
                >
                  {submitting 
                    ? (isEditing ? "Updating..." : "Registering...") 
                    : (isEditing ? "Update Profile" : "Complete Registration")
                  }
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
