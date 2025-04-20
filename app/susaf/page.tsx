"use client"

export default function SusAFPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">SusAF</h1>
      <div className="w-full h-[107vh]">
        <iframe
          src="https://susaf.se4gd.eu/"
          className="w-full h-full border rounded-lg"
          allowFullScreen
        />
      </div>
    </div>
  )
}
