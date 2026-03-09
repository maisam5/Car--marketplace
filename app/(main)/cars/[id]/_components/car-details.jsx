"use client"
import { toggleSavedCar } from '@/actions/car-listing';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import useFetch from '@/custom-hooks/use-fetch';
import { formatCurrency } from '@/lib/helper';
import { useAuth } from '@clerk/nextjs';
import { Calendar, Car, Fuel, Gauge, Heart, MessageSquare, Share2, Zap, Shield, Info } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';
import EmiCalculator from './emi-calculator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';

const CarDetailsPage = ({ car, testDriveInfo }) => {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(car.wishlisted);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    loading: savingCar,
    fn: toggleSavedCarFn,
  } = useFetch(toggleSavedCar);

  const handleSaveCar = async () => {
    if (!isSignedIn) { toast.error("Please sign in to save cars"); router.push("/sign-in"); return; }
    if (savingCar) return;
    const result = await toggleSavedCarFn(car.id);
    if (result?.success) { setIsWishlisted(result.saved); toast.success(result.message); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${car.year} ${car.make} ${car.model}`, text: `Check out this ${car.year} ${car.make} ${car.model}`, url: window.location.href })
        .catch(() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); });
    } else { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }
  };

  const handleBookTestDrive = () => {
    if (!isSignedIn) { toast.error("Please sign in to book a test drive"); router.push("/sign-in"); return; }
    router.push(`/test-drive/${car.id}`);
  };

  const isSoldOrUnavailable = car.status === "SOLD" || car.status === "UNAVAILABLE";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .cdp-root * { box-sizing: border-box; }
        .cdp-root { font-family: 'DM Sans', sans-serif; background: #f8f7f5; min-height: 100vh; }

        .cdp-hero { 
          background: #0f0f0f; 
          padding: 32px 0 0 0;
          position: relative;
          overflow: hidden;
        }
        .cdp-hero::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .cdp-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        .cdp-grid { display: grid; grid-template-columns: 1fr 420px; gap: 48px; align-items: start; }
        @media (max-width: 900px) { .cdp-grid { grid-template-columns: 1fr; } }

        /* Image area */
        .cdp-img-main {
          aspect-ratio: 16/9;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          background: #1a1a1a;
        }
        .cdp-thumbs { display: flex; gap: 8px; margin-top: 12px; overflow-x: auto; padding-bottom: 4px; }
        .cdp-thumb {
          flex-shrink: 0;
          width: 80px; height: 56px;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.2s, outline 0.2s;
          outline: 2px solid transparent;
        }
        .cdp-thumb.active { opacity: 1; outline: 2px solid #3b82f6; }
        .cdp-thumb:hover { opacity: 0.85; }

        .cdp-actions { display: flex; gap: 10px; margin-top: 16px; padding-bottom: 32px; }
        .cdp-btn-ghost {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 20px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.75);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .cdp-btn-ghost:hover { background: rgba(255,255,255,0.1); color: #fff; border-color: rgba(255,255,255,0.25); }
        .cdp-btn-ghost.wishlisted { color: #f87171; border-color: rgba(248,113,113,0.3); }

        /* Right panel */
        .cdp-panel { padding: 32px 0; color: #0f0f0f; }
        .cdp-badge {
          display: inline-block;
          background: #e8f0ff; color: #2563eb;
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          padding: 4px 12px; border-radius: 100px;
          margin-bottom: 12px;
        }
        .cdp-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(26px, 4vw, 38px);
          font-weight: 800;
          line-height: 1.1;
          color: #fff;
          margin: 0 0 8px 0;
        }
        .cdp-price {
          font-family: 'Syne', sans-serif;
          font-size: 28px; font-weight: 700;
          color: #3b82f6;
          margin-bottom: 24px;
        }

        .cdp-specs {
          display: flex; gap: 8px; flex-wrap: wrap;
          margin-bottom: 28px;
        }
        .cdp-spec-chip {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 8px 14px;
          color: rgba(255,255,255,0.8);
          font-size: 13px; font-weight: 400;
        }
        .cdp-spec-chip svg { opacity: 0.6; }

        /* EMI Card */
        .cdp-emi-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 18px 20px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cdp-emi-card:hover { background: rgba(255,255,255,0.1); border-color: rgba(59,130,246,0.4); }
        .cdp-emi-label {
          display: flex; align-items: center; gap-8px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: #3b82f6; margin-bottom: 6px;
          gap: 6px;
        }
        .cdp-emi-amount { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: #fff; }
        .cdp-emi-sub { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; }

        /* Info card */
        .cdp-info-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 18px 20px;
          margin-bottom: 12px;
        }
        .cdp-info-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 6px;
        }
        .cdp-info-text { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.5; margin-bottom: 12px; }
        .cdp-request-btn {
          width: 100%; padding: 11px;
          border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.2);
          background: transparent;
          color: rgba(255,255,255,0.8);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .cdp-request-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }

        /* Book Drive CTA */
        .cdp-cta {
          width: 100%; padding: 16px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700; letter-spacing: 0.02em;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          margin-top: 4px;
          box-shadow: 0 8px 24px rgba(37,99,235,0.35);
        }
        .cdp-cta:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); transform: translateY(-1px); box-shadow: 0 12px 32px rgba(37,99,235,0.45); }
        .cdp-cta:disabled { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); box-shadow: none; cursor: not-allowed; transform: none; }

        /* Bottom section */
        .cdp-bottom { padding: 64px 24px; max-width: 1200px; margin: 0 auto; }
        .cdp-bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        @media (max-width: 700px) { .cdp-bottom-grid { grid-template-columns: 1fr; } }

        .cdp-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 800;
          color: #0f0f0f; margin-bottom: 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .cdp-section-title::before {
          content: '';
          display: block; width: 4px; height: 22px;
          background: #3b82f6; border-radius: 4px;
        }

        .cdp-desc { font-size: 14px; line-height: 1.8; color: #555; white-space: pre-line; }

        .cdp-features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .cdp-feat-card {
          background: #fff;
          border: 1px solid #efefef;
          border-radius: 12px;
          padding: 14px 16px;
          transition: box-shadow 0.2s;
        }
        .cdp-feat-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
        .cdp-feat-key {
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #aaa; margin-bottom: 4px;
          display: flex; align-items: center; gap: 4px;
        }
        .cdp-feat-key::before { content: ''; display: block; width: 5px; height: 5px; background: #3b82f6; border-radius: 50%; }
        .cdp-feat-val { font-size: 14px; font-weight: 600; color: #1a1a1a; }

        .cdp-sold-alert {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 12px;
          padding: 14px 18px;
          margin-bottom: 12px;
          color: #dc2626;
          font-size: 14px; font-weight: 500;
        }
      `}</style>

      <div className="cdp-root">
        {/* Dark Hero Section */}
        <div className="cdp-hero">
          <div className="cdp-container">
            <div className="cdp-grid">
              {/* LEFT: Images */}
              <div>
                <div className="cdp-img-main">
                  {car.images && car.images.length > 0 ? (
                    <Image
                      src={car.images[currentImageIndex]}
                      alt={`${car.year} ${car.make} ${car.model}`}
                      fill className="object-cover" priority
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Car style={{ width: 80, height: 80, color: '#444' }} />
                    </div>
                  )}
                </div>

                {car.images && car.images.length > 1 && (
                  <div className="cdp-thumbs">
                    {car.images.map((image, index) => (
                      <div
                        key={index}
                        className={`cdp-thumb ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <Image src={image} alt={`view ${index + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="cdp-actions">
                  <button
                    className={`cdp-btn-ghost ${isWishlisted ? 'wishlisted' : ''}`}
                    onClick={handleSaveCar}
                    disabled={savingCar}
                  >
                    <Heart size={16} style={isWishlisted ? { fill: '#f87171' } : {}} />
                    {isWishlisted ? 'Saved' : 'Save'}
                  </button>
                  <button className="cdp-btn-ghost" onClick={handleShare}>
                    <Share2 size={16} />
                    Share
                  </button>
                </div>
              </div>

              {/* RIGHT: Info Panel */}
              <div className="cdp-panel">
                <div className="cdp-badge">{car.bodyType}</div>
                <h1 className="cdp-title">{car.year} {car.make} {car.model}</h1>
                <div className="cdp-price">{formatCurrency(car.price)}</div>

                <div className="cdp-specs">
                  <div className="cdp-spec-chip"><Gauge size={14} />{car.mileage.toLocaleString()} mi</div>
                  <div className="cdp-spec-chip"><Fuel size={14} />{car.fuelType}</div>
                  <div className="cdp-spec-chip"><Car size={14} />{car.transmission}</div>
                </div>

                {/* EMI */}
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="cdp-emi-card">
                      <div className="cdp-emi-label"><Zap size={12} />EMI Calculator</div>
                      <div className="cdp-emi-amount">{formatCurrency(car.price / 60)}<span style={{ fontSize: 14, fontWeight: 400, opacity: 0.5 }}>/mo</span></div>
                      <div className="cdp-emi-sub">Est. for 60 months · $0 down · 4.5% APR · Tap to calculate</div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg p-0">
                    <DialogHeader><DialogTitle></DialogTitle></DialogHeader>
                    <EmiCalculator />
                  </DialogContent>
                </Dialog>

                {/* Info */}
                <div className="cdp-info-card">
                  <div className="cdp-info-label"><MessageSquare size={12} />Questions?</div>
                  <div className="cdp-info-text">Our specialists are ready to help with any queries about this vehicle.</div>
                  <a href="mailto:help@carhub.in">
                    <button className="cdp-request-btn"><Info size={13} style={{ display: 'inline', marginRight: 6 }} />Request Info</button>
                  </a>
                </div>

                {/* Status / CTA */}
                {isSoldOrUnavailable ? (
                  <div className="cdp-sold-alert">
                    🚫 This car is currently <strong>{car.status.toLowerCase()}</strong>. Please check back later.
                  </div>
                ) : (
                  <button
                    className="cdp-cta"
                    disabled={!!testDriveInfo.userTestDrive}
                    onClick={handleBookTestDrive}
                  >
                    <Calendar size={18} />
                    {testDriveInfo.userTestDrive
                      ? `Booked · ${format(new Date(testDriveInfo.userTestDrive.bookingDate), "MMM d, yyyy")}`
                      : "Book a Test Drive"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Description & Features */}
        <div className="cdp-bottom">
          <div className="cdp-bottom-grid">
            <div>
              <div className="cdp-section-title">Description</div>
              <p className="cdp-desc">{car.description}</p>
            </div>

            <div>
              <div className="cdp-section-title">Features</div>
              <div className="cdp-features-grid">
                {[
                  { label: "Transmission", value: car.transmission },
                  { label: "Engine", value: car.fuelType },
                  { label: "Body Style", value: car.bodyType },
                  { label: "Exterior", value: car.color },
                  { label: "Seats", value: car.seats },
                  { label: "Year", value: car.year },
                ].filter(f => f.value).map((feature, index) => (
                  <div key={index} className="cdp-feat-card">
                    <div className="cdp-feat-key">{feature.label}</div>
                    <div className="cdp-feat-val">{feature.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CarDetailsPage;