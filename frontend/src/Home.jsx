import { Link } from "react-router-dom";
import {
  MapPin,
  Camera,
  BrainCircuit,
  ClipboardList,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

function App() {
  const features = [
    {
      icon: Camera,
      title: "Easy Issue Reporting",
      description:
        "Upload photos of potholes, garbage, damaged roads and other civic problems."
    },
    {
      icon: BrainCircuit,
      title: "AI-Powered Detection",
      description:
        "Artificial intelligence helps identify and categorize reported civic issues."
    },
    {
      icon: MapPin,
      title: "Location Tracking",
      description:
        "Identify the exact location of reported problems using GPS."
    },
    {
      icon: ClipboardList,
      title: "Track Complaints",
      description:
        "Follow complaint progress and receive updates about resolution."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-blue-700">
          CivicAI
        </h1>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#home" className="hover:text-blue-600">Home</a>
          <a href="#features" className="hover:text-blue-600">Features</a>
          <a href="#how-it-works" className="hover:text-blue-600">How it works</a>
        </div>

        <div className="flex gap-3">
  <Link
    to="/login"
    className="px-4 py-2 text-blue-700 font-medium hover:text-blue-900"
  >
    Login
  </Link>

  <Link
    to="/register"
    className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
  >
    Register
  </Link>
</div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="px-8 py-24 text-center bg-gradient-to-br from-blue-50 to-indigo-100"
      >
        <div className="mx-auto max-w-4xl">

          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            Smarter Cities, Better Communities
          </span>

          <h2 className="mt-8 text-4xl font-extrabold leading-tight md:text-6xl">
            Building Better Cities
            <span className="block text-blue-700">
              Together with AI
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Report civic issues, track their progress and help
            authorities create cleaner, safer and smarter communities.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a
              href="#features"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Explore Platform <ArrowRight size={18} />
            </a>

            <a
              href="#how-it-works"
              className="rounded-lg border border-slate-300 bg-white px-7 py-3 font-semibold hover:bg-slate-100"
            >
              How It Works
            </a>
          </div>

        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-8 py-20">
        <div className="mx-auto max-w-6xl">

          <div className="text-center">
            <h2 className="text-3xl font-bold">
              Platform Features
            </h2>
            <p className="mt-3 text-slate-600">
              Technology that connects citizens and authorities.
            </p>
          </div>

          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-5 inline-flex rounded-lg bg-blue-100 p-3 text-blue-700">
                    <Icon size={26} />
                  </div>

                  <h3 className="text-lg font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white px-8 py-20">
        <div className="mx-auto max-w-5xl text-center">

          <h2 className="text-3xl font-bold">
            How CivicAI Works
          </h2>

          <div className="mt-12 grid gap-10 md:grid-cols-3">

            <div>
              <Camera className="mx-auto text-blue-600" size={36} />
              <h3 className="mt-4 font-bold">1. Report</h3>
              <p className="mt-2 text-sm text-slate-600">
                Upload an image and provide the issue location.
              </p>
            </div>

            <div>
              <BrainCircuit className="mx-auto text-blue-600" size={36} />
              <h3 className="mt-4 font-bold">2. AI Analysis</h3>
              <p className="mt-2 text-sm text-slate-600">
                AI analyzes the image and identifies the issue.
              </p>
            </div>

            <div>
              <ClipboardList className="mx-auto text-blue-600" size={36} />
              <h3 className="mt-4 font-bold">3. Resolution</h3>
              <p className="mt-2 text-sm text-slate-600">
                Authorities manage complaints and update their status.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="bg-blue-700 px-8 py-16 text-center text-white">
        <ShieldCheck className="mx-auto" size={42} />

        <h2 className="mt-5 text-3xl font-bold">
          Every Report Makes a Difference
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-blue-100">
          Join citizens and authorities working together
          towards better urban communities.
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 px-8 py-8 text-center text-slate-400">
        <p className="font-semibold text-white">CivicAI</p>
        <p className="mt-2 text-sm">
          AI-Powered Citizen Issue Reporting and Resolution Platform
        </p>
        <p className="mt-4 text-xs">
          © 2026 CivicAI. College Major Project.
        </p>
      </footer>

    </div>
  );
}

export default App;
