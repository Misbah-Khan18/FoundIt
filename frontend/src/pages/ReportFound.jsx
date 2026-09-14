import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, CheckCircle2, X } from "lucide-react";
import PageHero from "../components/PageHero.jsx";
import { CATEGORIES, CAMPUS_LOCATIONS } from "../data/mockItems.js";
import { useReports } from "../context/ReportsContext.jsx";
import "../components/ReportForm.css";

export default function ReportFound() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { createReport } = useReports();

  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0] || "Electronics",
    location: CAMPUS_LOCATIONS[0] || "Main Building (Ground Floor)",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });



  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be under 5MB.");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Item name is required.");
      return;
    }
    if (!form.location.trim()) {
      setError("Location is required.");
      return;
    }
    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!form.date) {
      setError("Please select a valid date.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("type", "found");
      formData.append("title", form.title.trim());
      formData.append("category", form.category);
      formData.append("location", form.location);
      formData.append("item_date", form.date);
      formData.append("description", form.description.trim());

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await createReport(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "An unexpected error occurred while saving report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Report"
        title="Report a Found Item"
        subtitle="Help us reunite this item with its owner as quickly as possible."
      />

      <section className="section">
        <div className="section-inner report-form">
          {submitted ? (
            <div
              className="card report-form__card"
              style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "48px 32px",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "rgba(30, 54, 116, 0.08)",
                  color: "var(--navy-900)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "8px",
                }}
              >
                <CheckCircle2 size={28} strokeWidth={2.2} />
              </div>

              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.4rem",
                  color: "var(--ink)",
                  margin: 0,
                }}
              >
                Thank you — your report has been submitted!
              </h2>

              <p
                style={{
                  fontSize: "0.95rem",
                  color: "var(--slate-500)",
                  margin: "0 0 18px",
                  maxWidth: "44ch",
                }}
              >
                We'll notify you if a match is found.
              </p>

              <button
                type="button"
                className="btn btn--emerald"
                onClick={() => navigate("/my-reports")}
              >
                View My Reports
              </button>
            </div>
          ) : (
            <form className="form card report-form__card" onSubmit={handleSubmit}>
              {error && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    background: "rgba(210, 31, 43, 0.1)",
                    color: "var(--red-500)",
                    border: "1px solid rgba(210, 31, 43, 0.25)",
                    fontSize: "0.875rem",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="field">
                <label className="field__label" htmlFor="title">Item title</label>
                <input
                  id="title"
                  className="input"
                  placeholder="e.g. Silver Wristwatch"
                  required
                  value={form.title}
                  onChange={update("title")}
                />
              </div>

              <div className="form-row">
                <div className="field">
                  <label className="field__label" htmlFor="category">Category</label>
                  <select id="category" className="select" value={form.category} onChange={update("category")}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label className="field__label" htmlFor="location">Where you found it</label>
                  </div>
                  <select id="location" className="select" value={form.location} onChange={update("location")}>
                    {CAMPUS_LOCATIONS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="date">Date found</label>
                <input
                  id="date"
                  type="date"
                  className="input"
                  required
                  value={form.date}
                  onChange={update("date")}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="textarea"
                  placeholder="Color, brand, distinguishing marks, where it's currently kept..."
                  required
                  value={form.description}
                  onChange={update("description")}
                />
              </div>

              <div className="field">
                <span className="field__label">Photo (optional)</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />

                {!imagePreview ? (
                  <div
                    className="file-drop"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ cursor: "pointer" }}
                  >
                    <UploadCloud size={20} strokeWidth={2} />
                    Click to choose or upload an image
                  </div>
                ) : (
                  <div style={{ position: "relative", display: "inline-block", marginTop: "0.5rem" }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxHeight: "160px", borderRadius: "0.5rem", border: "1px solid var(--border-light)", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        background: "rgba(30, 54, 116, 0.8)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn--emerald" disabled={loading}>
                {loading ? "Submitting Report..." : "Submit Found Item"}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
