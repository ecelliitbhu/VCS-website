"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FaWhatsapp } from "react-icons/fa";

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
    <div className="min-h-screen flex items-start justify-center px-4 pb-14 pt-8 md:pt-10">
      <div
        className={`scout-panel scout-panel--static w-full p-6 text-[#F8FAFC] sm:p-10 ${
          isSuccess ? "max-w-md" : "max-w-4xl"
        }`}
      >
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
                  href="https://chat.whatsapp.com/Fs0mgKCDPwYKsgSH9bLlIE?mode=gi_t"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsAppClick}
                  className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-7 text-sm font-semibold text-[#06281a] shadow-[0_0_28px_rgba(37,211,102,0.3)] transition-all duration-200 hover:bg-[#3ee27a] hover:shadow-[0_0_36px_rgba(37,211,102,0.5)] active:scale-[0.97] w-full"
                >
                  <FaWhatsapp className="h-5 w-5" />
                  Join Now (WhatsApp)
                </a>
              </>
            )}
          </div>
        ) : (
          <>
            <h1 className="scout-heading text-3xl mb-6 text-left pb-2">
              {isEditing ? "Update Profile" : "Course Registration"}
            </h1>

            {errors && (
              <div className="mb-4 p-3 border border-[#C42F35] bg-[#C42F35]/10 text-[#ff9a9a] rounded-[2px] text-sm">
                {errors}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-x-6 gap-y-5 md:grid-cols-2">
              <div>
                <label className="block font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#94A3B8] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  required
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="scout-field"
                />
              </div>

              <div>
                <label className="block font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#94A3B8] mb-1.5">
                  Institution *
                </label>
                <input
                  type="text"
                  name="institution"
                  required
                  placeholder="Enter your institute"
                  value={formData.institution}
                  onChange={handleChange}
                  className="scout-field"
                />
              </div>

              <div>
                <label className="block font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#94A3B8] mb-1.5">
                  Current Year *
                </label>
                <select
                  name="current_year"
                  required
                  value={formData.current_year}
                  onChange={handleChange}
                  className="scout-field"
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
                  <label className="block font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#94A3B8] mb-1.5">
                    Please Specify Year *
                  </label>
                  <input
                    type="text"
                    name="current_year_other"
                    required
                    value={formData.current_year_other}
                    onChange={handleChange}
                    className="scout-field"
                    placeholder="e.g., Alumni, Pre-University"
                  />
                </div>
              )}

              <div>
                <label className="block font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#94A3B8] mb-1.5">
                  Course *
                </label>
                <select
                  name="course"
                  required
                  value={formData.course}
                  onChange={handleChange}
                  className="scout-field"
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
                  <label className="block font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#94A3B8] mb-1.5">
                    Please Specify Course *
                  </label>
                  <input
                    type="text"
                    name="course_other"
                    required
                    value={formData.course_other}
                    onChange={handleChange}
                    className="scout-field"
                    placeholder="e.g., BBA, BCA"
                  />
                </div>
              )}

              <div>
                <label className="block font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#94A3B8] mb-1.5">
                  Branch *
                </label>
                <select
                  name="branch"
                  required
                  value={formData.branch}
                  onChange={handleChange}
                  className="scout-field"
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
                  <label className="block font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#94A3B8] mb-1.5">
                    Please Specify Branch *
                  </label>
                  <input
                    type="text"
                    name="branch_other"
                    required
                    value={formData.branch_other}
                    onChange={handleChange}
                    className="scout-field"
                    placeholder="e.g., Data Science, AI & ML"
                  />
                </div>
              )}

              <div>
                <label className="block font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#94A3B8] mb-1.5">
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
                  className="scout-field"
                />
              </div>

              <div className="flex w-full justify-start pt-2 md:col-span-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  variant="default"
                  size="lg"
                  className="w-full sm:w-auto sm:min-w-[16rem]"
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
