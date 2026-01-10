<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'title' => 'About Fischer',
                'slug' => 'about',
                'content' => $this->getAboutContent(),
                'meta_title' => 'About Fischer Pakistan - Leading Appliances Manufacturer Since 1990',
                'meta_description' => 'Learn about Fischer (Fatima Engineering Works), Pakistan\'s leading appliances manufacturer since 1990. ISO 9001-2008 certified and PSQCA approved.',
                'status' => 'published',
            ],
            [
                'title' => 'Contact Us',
                'slug' => 'contact',
                'content' => $this->getContactContent(),
                'meta_title' => 'Contact Fischer Pakistan - Get in Touch',
                'meta_description' => 'Contact Fischer Pakistan for water coolers, geysers, cooking ranges. Call +92 321 1146642 or email fischer.few@gmail.com',
                'status' => 'published',
            ],
            [
                'title' => 'Find a Dealer',
                'slug' => 'find-a-dealer',
                'content' => $this->getDealerContent(),
                'meta_title' => 'Find a Fischer Dealer Near You',
                'meta_description' => 'Locate authorized Fischer dealers across Pakistan. Contact us on WhatsApp to find the nearest dealer in your city.',
                'status' => 'published',
            ],
            [
                'title' => 'Become a Dealer',
                'slug' => 'become-a-dealer',
                'content' => $this->getBecomeDealerContent(),
                'meta_title' => 'Become a Fischer Dealer - Partnership Opportunities',
                'meta_description' => 'Join the Fischer dealer network. Apply to become an authorized dealer for water coolers, geysers, and kitchen appliances in Pakistan.',
                'status' => 'published',
            ],
            [
                'title' => 'Service & Repair',
                'slug' => 'service-repair',
                'content' => $this->getServiceContent(),
                'meta_title' => 'Fischer Service & Repair - Product Support',
                'meta_description' => 'Request service and repair for your Fischer products. Expert technicians, genuine parts, and quick turnaround.',
                'status' => 'published',
            ],
            [
                'title' => 'Our Clients',
                'slug' => 'our-clients',
                'content' => $this->getClientsContent(),
                'meta_title' => 'Fischer Clients - Trusted by Leading Organizations',
                'meta_description' => 'See the organizations that trust Fischer for their water cooling, heating, and kitchen solutions.',
                'status' => 'published',
            ],
        ];

        foreach ($pages as $page) {
            Page::firstOrCreate(
                ['slug' => $page['slug']],
                $page
            );
        }
    }

    private function getAboutContent(): string
    {
        return <<<HTML
<div class="about-content">
    <section class="intro">
        <h2>Our Story</h2>
        <p>Fischer (Fatima Engineering Works) was established in <strong>1990</strong> in Lahore, Pakistan. With over three decades of experience, we have become a leading manufacturer and supplier of commercial, domestic, and industrial appliances.</p>
    </section>

    <section class="mission">
        <h2>Our Mission</h2>
        <p>To enhance people's lives by developing products and solutions for a quiet, healthy, and stylish home. We aim to provide durable, high-performance, and reliable appliances through certified engineers and state-of-the-art technology.</p>
    </section>

    <section class="values">
        <h2>Our Values</h2>
        <ul>
            <li><strong>Quality Assurance:</strong> Certified engineers and advanced safety standards</li>
            <li><strong>Customer Satisfaction:</strong> Reliable, efficient products guaranteed</li>
            <li><strong>Team Unity:</strong> Dedicated workforce functioning as a unified team</li>
            <li><strong>Excellence in Service:</strong> Timely delivery and responsive customer support</li>
        </ul>
    </section>

    <section class="certifications">
        <h2>Certifications & Standards</h2>
        <ul>
            <li>ISO 9001-2008 certified manufacturing setup</li>
            <li>PSQCA (Pakistan Standards and Quality Control Authority) approved products</li>
            <li>Advanced safety and protection standards in all manufacturing</li>
        </ul>
    </section>

    <section class="manufacturing">
        <h2>Manufacturing Excellence</h2>
        <p>Our well-equipped manufacturing facility features:</p>
        <ul>
            <li>Qualified and experienced production team</li>
            <li>Experienced engineers and supervisors</li>
            <li>Highly skilled technicians</li>
            <li>Strong management and quality control systems</li>
        </ul>
    </section>

    <section class="products">
        <h2>Our Product Range</h2>
        <ul>
            <li>Water Coolers (including storage type)</li>
            <li>Cooking Ranges</li>
            <li>Geysers and Heaters</li>
            <li>Water Dispensers</li>
            <li>Built-in Hobs and Kitchen Hoods</li>
            <li>Kitchen Accessories</li>
        </ul>
    </section>
</div>
HTML;
    }

    private function getContactContent(): string
    {
        return <<<HTML
<div class="contact-content">
    <section class="contact-info">
        <h2>Get in Touch</h2>
        <p>We believe in having a human voice on the end of the phone, and providing you with the products that are most appropriate for you.</p>

        <div class="contact-details">
            <div class="contact-item">
                <h3>Phone</h3>
                <p>Landline: +92 (42) 35943091 or 93</p>
                <p>WhatsApp: +92 321 1146642</p>
            </div>

            <div class="contact-item">
                <h3>Email</h3>
                <p>fischer.few@gmail.com</p>
            </div>

            <div class="contact-item">
                <h3>Address</h3>
                <p>Pindi Stop, Peco Road<br>Lahore, Pakistan</p>
            </div>

            <div class="contact-item">
                <h3>Follow Us</h3>
                <p>Facebook: @fischerpakistan</p>
                <p>Instagram: @fischerpklhr</p>
            </div>
        </div>
    </section>
</div>
HTML;
    }

    private function getDealerContent(): string
    {
        return <<<HTML
<div class="dealer-content">
    <section class="dealer-network">
        <h2>Find a Dealer Near You</h2>
        <p>Fischer has a dealer network for its products all across Pakistan. Send us a message with your city and nearest landmark or address on WhatsApp to find out location of the nearest dealer in your city.</p>

        <div class="dealer-contact">
            <h3>Contact Us</h3>
            <p><strong>WhatsApp:</strong> +92 321 1146642</p>
            <p><strong>Email:</strong> fischer.few@gmail.com</p>
            <p><strong>Facebook:</strong> @fischerpakistan</p>
            <p><strong>Instagram:</strong> @fischerpklhr</p>
        </div>
    </section>
</div>
HTML;
    }

    private function getBecomeDealerContent(): string
    {
        return <<<HTML
<div class="become-dealer-content">
    <section class="partnership">
        <h2>A Winning Partnership</h2>
        <p>Join the Fischer dealer network and grow your business with Pakistan's leading appliances brand.</p>

        <h3>Application Requirements</h3>
        <ul>
            <li>Business Name</li>
            <li>Applicant Name</li>
            <li>City</li>
            <li>Email Address</li>
            <li>Phone Number</li>
            <li>Business establishment date</li>
            <li>Business type (Electronics Store, Multibrand Retails, or Ecommerce)</li>
            <li>Current similar brands you are working with</li>
        </ul>

        <h3>Contact for Dealership Inquiries</h3>
        <p><strong>Phone:</strong> +92 321 1146642</p>
        <p><strong>Email:</strong> fischer.few@gmail.com</p>
    </section>
</div>
HTML;
    }

    private function getServiceContent(): string
    {
        return <<<HTML
<div class="service-content">
    <section class="service-process">
        <h2>Service & Repair Process</h2>
        <p>Fischer offers an organized complaint registration system:</p>

        <ol>
            <li><strong>Initial Contact:</strong> Submit online complaint about the product</li>
            <li><strong>Scheduling:</strong> Customer Service Team contacts you to arrange an onsite visit</li>
            <li><strong>Inspection:</strong> Skilled technician inspects the product at your location</li>
            <li><strong>Resolution:</strong> Issues typically resolved onsite; some products may require service center repair</li>
            <li><strong>Installation & Feedback:</strong> Fixed product reinstalled; follow-up contact for satisfaction assessment</li>
        </ol>

        <h3>What You'll Need</h3>
        <ul>
            <li>Product Name</li>
            <li>Date of Purchase</li>
            <li>Description of the issue</li>
            <li>Picture of warranty card</li>
        </ul>

        <h3>Contact Service Team</h3>
        <p><strong>Phone:</strong> +92 321 1146642</p>
        <p><strong>Email:</strong> fischer.few@gmail.com</p>
    </section>
</div>
HTML;
    }

    private function getClientsContent(): string
    {
        return <<<HTML
<div class="clients-content">
    <section class="corporate-clients">
        <h2>Our Corporate Clients</h2>
        <p>Fischer is trusted by leading organizations across Pakistan for their water cooling, heating, and kitchen solutions.</p>

        <p>Are you a company looking for a water heating or cooling solution? Want to chill the air with our air coolers or planning to setup a kitchen with our cooking range solutions?</p>

        <p><strong>Contact us and our team will be happy to guide you.</strong></p>

        <h3>Industries We Serve</h3>
        <ul>
            <li>Commercial Food Service</li>
            <li>Hospitality & Hotels</li>
            <li>Educational Institutions</li>
            <li>Healthcare Facilities</li>
            <li>Corporate Offices</li>
            <li>Industrial Facilities</li>
            <li>Religious Institutions</li>
        </ul>
    </section>
</div>
HTML;
    }
}
