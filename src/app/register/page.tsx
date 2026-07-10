"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading,setLoading] = useState(false);
  const [show,setShow]       = useState(false);
  const [form,setForm]       = useState({name:"",email:"",password:"",confirm:""});

  const submit = async (e:React.FormEvent) => {
    e.preventDefault();
    if(form.password!==form.confirm){toast.error("Passwords don't match");return;}
    if(form.password.length<8){toast.error("Password must be 8+ characters");return;}
    setLoading(true);
    try{
      const {error} = await signUp.email({name:form.name,email:form.email,password:form.password});
      if(error){toast.error(error.message||"Registration failed");}
      else{toast.success("Account created!");router.push("/dashboard");}
    }catch{toast.error("Something went wrong");}
    finally{setLoading(false);}
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-ink flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-lime"/>
            </div>
            <span className="font-bold text-ink text-lg tracking-tight">Portfolio CMS</span>
          </Link>
          <h1 className="text-3xl font-bold text-ink tracking-tightest">Create account</h1>
          <p className="text-ink-3 text-sm mt-1">Start managing your portfolio</p>
        </div>

        <div className="card p-8">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Full name</label>
              <input type="text" className="input-base" placeholder="Alex Johnson"
                value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
            </div>
            <div>
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Email</label>
              <input type="email" className="input-base" placeholder="alex@example.com"
                value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
            </div>
            <div>
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <input type={show?"text":"password"} className="input-base pr-10" placeholder="Minimum 8 characters"
                  value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink">
                  {show?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-ink-2 text-xs font-semibold tracking-wide mb-1.5">Confirm password</label>
              <input type="password" className="input-base" placeholder="Repeat your password"
                value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} required/>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading?"Creating account…":"Create account"} <ArrowRight size={15} strokeWidth={2.5}/>
            </button>
          </form>
          <p className="text-center text-ink-3 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-ink font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
