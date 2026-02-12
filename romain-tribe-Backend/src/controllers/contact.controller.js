import Contact from "../models/contact.model.js";

/**
 * GET CONTACT INFO
 */
export const getContact = async (req, res) => {
  try {
    let contact = await Contact.findOne();

    // If no contact exists, create default one
    if (!contact) {
      contact = await Contact.create({
        brandName: "",
        tagline: "",
        email: "",
        phone: "",
        whatsapp: "",
        address: "",
        social: {
          instagram: "",
          facebook: "",
          twitter: "",
          youtube: "",
          linkedin: "",
        },
        footerText: "",
        copyrightText: "",
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Get contact error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UPDATE CONTACT INFO
 */
export const updateContact = async (req, res) => {
  try {
    const {
      brandName,
      tagline,
      email,
      phone,
      whatsapp,
      address,
      social,
      footerText,
      copyrightText,
    } = req.body;

    // Find existing contact or create new one
    let contact = await Contact.findOne();

    if (contact) {
      // Update existing contact
      contact = await Contact.findByIdAndUpdate(
        contact._id,
        {
          brandName,
          tagline,
          email,
          phone,
          whatsapp,
          address,
          social,
          footerText,
          copyrightText,
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new contact
      contact = await Contact.create({
        brandName,
        tagline,
        email,
        phone,
        whatsapp,
        address,
        social,
        footerText,
        copyrightText,
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact information updated successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};