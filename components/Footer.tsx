import { getCategoriesList } from "@/data/categories";
import { getCollectionList } from "@/data/collections";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

export default async function Footer() {
  const collections = await getCollectionList();
  const categories = await getCategoriesList();

  return (
    <footer className="relative w-full flex-shrink-0">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#e7f5e7] via-[#d0ebd0] to-[#a5d6a5] opacity-90" />

      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="block">
              <h2 className="text-2xl font-bold text-gray-800">Petapt</h2>
            </Link>
            <p className="text-sm text-gray-700">
              Your one-stop destination for all pet needs. Bringing joy to pets
              and their families since 2024.
            </p>
            <div className="flex pt-4 space-x-4">
              <a
                href="#"
                className="text-gray-600 transition-colors duration-200 hover:text-gray-800"
              >
                <FaFacebook className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-600 transition-colors duration-200 hover:text-gray-800"
              >
                <FaInstagram className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-600 transition-colors duration-200 hover:text-gray-800"
              >
                <FaTwitter className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-600 transition-colors duration-200 hover:text-gray-800"
              >
                <FaLinkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-800 uppercase">
              Categories
            </h3>
            <ul className="space-y-2">
              {categories?.map((category) => {
                return (
                  <li key={category.id}>
                    <Link
                      href={`/categories/${category.slug}`}
                      className="text-sm text-gray-700 transition-colors duration-200 hover:text-gray-900"
                    >
                      {category.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-800 uppercase">
              Collections
            </h3>
            <ul>
              {collections?.map((collection) => {
                return (
                  <li key={collection.id}>
                    <Link
                      href={`/collections/${collection.slug}`}
                      className="text-sm text-gray-700 transition-colors duration-200 hover:text-gray-900"
                    >
                      {collection.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-800 uppercase">
              Contact & Support
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <p>Email: petwale365@gmail.com</p>
              </li>
              <li>
                <p>Phone: +91 8876911659</p>
              </li>
              <li></li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors duration-200 hover:text-gray-900"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="transition-colors duration-200 hover:text-gray-900"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-green-200/50">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <p className="text-sm text-gray-700">
              © {new Date().getFullYear()} Petapt. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-700 transition-colors duration-200 hover:text-gray-900"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-700 transition-colors duration-200 hover:text-gray-900"
              >
                Terms of Service
              </Link>
              <Link
                href="/shipping"
                className="text-sm text-gray-700 transition-colors duration-200 hover:text-gray-900"
              >
                Shipping Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom wave */}
      {/* <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-r from-sky-200 via-sky-400 to-green-200" /> */}
    </footer>
  );
}
