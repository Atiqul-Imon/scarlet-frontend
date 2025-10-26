"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowPathIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-herlan py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-red-700 hover:text-red-800 transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <ArrowPathIcon className="w-6 h-6 text-red-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Return & Refund Policy</h1>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Important Notice */}
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-8">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Important Notice</h3>
                  <p className="text-red-800 text-sm leading-relaxed">
                    Refunds are processed within <strong>7 to 10 working days</strong> after we receive your returned item. 
                    This timeline ensures proper inspection and processing of your return.
                  </p>
                </div>
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Return Eligibility</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We offer a 30-day return policy from the date of delivery. To be eligible for a return, your item must be:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Unused and in the same condition as received</li>
                <li>In the original packaging with all tags and labels intact</li>
                <li>Accompanied by the original receipt or proof of purchase</li>
                <li>Not damaged due to misuse or negligence</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Items Not Eligible for Return</h2>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Non-Returnable Items:</h4>
                <ul className="text-yellow-800 text-sm space-y-1">
                  <li>Personal care items (opened cosmetics, skincare products)</li>
                  <li>Items damaged by customer misuse</li>
                  <li>Items without original packaging or tags</li>
                  <li>Customized or personalized items</li>
                  <li>Items purchased during clearance sales</li>
                  <li>Gift cards and digital products</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How to Initiate a Return</h2>
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-900 mb-3">Step-by-Step Return Process:</h4>
                <ol className="text-blue-800 text-sm space-y-2">
                  <li><strong>Contact Us:</strong> Email us at nabilasultana0000@gmail.com or call +880 1407 000543</li>
                  <li><strong>Provide Details:</strong> Include your order number, reason for return, and item details</li>
                  <li><strong>Receive Authorization:</strong> We'll provide a Return Authorization Number (RAN)</li>
                  <li><strong>Package Item:</strong> Pack the item securely in original packaging</li>
                  <li><strong>Ship Return:</strong> Send the item to our return address with the RAN</li>
                  <li><strong>Processing:</strong> We'll inspect and process your return within 7-10 working days</li>
                </ol>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Refund Processing Timeline</h2>
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg mb-4">
                <div className="flex items-start gap-3 mb-4">
                  <ClockIcon className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">Refund Timeline: 7-10 Working Days</h4>
                    <p className="text-green-800 text-sm">
                      Once we receive your returned item, we will process your refund within 7 to 10 working days. 
                      This includes inspection, verification, and processing time.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-green-700 font-bold text-sm">1-2</span>
                    </div>
                    <p className="text-green-800 text-xs font-medium">Days: Receive & Inspect</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-green-700 font-bold text-sm">3-5</span>
                    </div>
                    <p className="text-green-800 text-xs font-medium">Days: Process Refund</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-green-700 font-bold text-sm">7-10</span>
                    </div>
                    <p className="text-green-800 text-xs font-medium">Days: Complete</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Refund Methods</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Refunds will be processed using the same payment method used for the original purchase:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Credit/Debit Cards:</strong> Refunded to the original card (7-10 working days)</li>
                <li><strong>bKash/Nagad/Rocket:</strong> Refunded to the original mobile account (7-10 working days)</li>
                <li><strong>Cash on Delivery:</strong> Bank transfer to provided account (7-10 working days)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Return Shipping</h2>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Shipping Costs:</h4>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li><strong>Defective/Damaged Items:</strong> We cover return shipping costs</li>
                  <li><strong>Wrong Item Sent:</strong> We cover return shipping costs</li>
                  <li><strong>Customer Change of Mind:</strong> Customer pays return shipping</li>
                  <li><strong>Return Address:</strong> House 123, Road 45, Dhanmondi, Dhaka 1205, Bangladesh</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Exchange Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We offer exchanges for items in different sizes or colors, subject to availability. 
                Exchange requests must be made within 30 days of delivery.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Exchange items must be unused and in original condition</li>
                <li>Price difference (if any) must be paid for upgrades</li>
                <li>Refunds will be processed for downgrades</li>
                <li>Exchange processing time: 7-10 working days</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Damaged or Defective Items</h2>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-red-900 mb-2">Immediate Action Required:</h4>
                <p className="text-red-800 text-sm mb-2">
                  If you receive a damaged or defective item, please contact us immediately:
                </p>
                <ul className="text-red-800 text-sm space-y-1">
                  <li>Email: nabilasultana0000@gmail.com</li>
                  <li>Phone: +880 1407 000543</li>
                  <li>Include photos of the damage/defect</li>
                  <li>Provide order number and item details</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Returns</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For international customers, return shipping costs are the responsibility of the customer. 
                Refunds will be processed in the original currency used for purchase.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  For return and refund inquiries, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> nabilasultana0000@gmail.com</p>
                  <p><strong>Phone:</strong> +880 1407 000543</p>
                  <p><strong>Address:</strong> 3 No. West Tejturi Bazar, Lt.-3, Block-B, Do.-55, Bashundhara City, Dhaka</p>
                  <p><strong>Business Hours:</strong> Mon-Fri: 9:00 AM - 6:00 PM, Sat-Sun: 10:00 AM - 4:00 PM</p>
                </div>
                <p className="text-gray-700 mt-4">
                  Please include your order number in all communications for faster processing.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Policy Updates</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to update this Return & Refund Policy at any time. 
                Changes will be posted on this page with an updated revision date.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}