"use client";

import { useState } from "react";
import { uploadPaper } from "../lib/api";

export default function Upload({ onUploaded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    setError("");
    setLoading(true);
    try {
      const paper = await uploadPaper(file);
      onUploaded(paper);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  }

  return (
    <section className="mx-auto max-w-xl text-center">
      <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Understand research papers in minutes
      </h2>
      <p className="mt-4 text-muted">
        Upload a research paper to get a structured summary, then ask questions about it.
      </p>

      <label className="mt-10 block cursor-pointer rounded-3xl border-2 border-dashed border-line bg-white p-10">
        <span className="block text-lg font-semibold">
          {loading ? "Reading your paper..." : "Choose a research paper"}
        </span>
        <span className="mt-1 block text-sm text-muted">One PDF at a time, up to 25 MB</span>
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFile}
          disabled={loading}
          className="sr-only"
        />
      </label>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
    </section>
  );
}
