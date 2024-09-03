// This functions can be invoked on client or server side
"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { v2 as cloudinary } from "cloudinary";

// Create formschema for Zod validation library
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  // Validate and trnsform data with Zod parse method
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  const amountInCents = amount * 100;
  // Adding the missing date
  const date = new Date().toISOString().split("T")[0];

  try {
    // Insert data into database
    await sql`
 INSERT INTO invoices (customer_id, amount, status, date)
 VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
`;
  } catch (error) {
    throw new Error("There is a problem creating an invoice");
  }

  // Once the database has been updated, the /dashboard/invoices path will be revalidated (cache will be deleted), and fresh data will be fetched from the server (a new request will be send).
  revalidatePath("/dashboard/invoices");
  // We redirect the user to the invoices page
  redirect("/dashboard/invoices");
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  const amountInCents = amount * 100;
  try {
    await sql`
  UPDATE invoices
  SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
  WHERE id = ${id}
`;
  } catch (error) {
    throw new Error("There is a problem updateing an invoice");
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (error) {
    throw new Error("There is a problem deleting an invoice");
  }

  revalidatePath("/dashboard/invoices");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

// Create formschema for Zod validation library
const CustomerFormSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email("Invalid email"),
  image_url: z.string(),
});

const CreateCustomer = CustomerFormSchema.omit({ id: true, image_url: true });

export async function createCustomer(formData: FormData) {
  // Validate and transform data with Zod parse method
  const file = formData.get("userImage") as File;

  try {
    if (!formData.get("name") || !formData.get("email") || file.size === 0)
      throw new Error(`Please fill in all fields and select an image!`);
  } catch (error) {
    // Return an error to the client side
    if (error instanceof Error) return { error: error.message };
  }

  const { name, email } = CreateCustomer.parse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  // email database validation
  try {
    const response =
      await sql`SELECT * FROM customers WHERE (email ILIKE ${email} or name ILIKE ${name}) `;
    if (response.rows.length !== 0)
      throw new Error(
        `The ${name} or the ${email} is already in the database!`
      );
  } catch (error) {
    // Return an error to the client side
    if (error instanceof Error) return { error: error.message };
  }

  const image_url = await saveFile(file);

  try {
    // Insert data into database
    await sql`
   INSERT INTO customers (name, email, image_url)
   VALUES (${name}, ${email}, ${image_url})
  `;
  } catch (error) {
    throw new Error("There is a problem creating a customer");
  }
  // Once the database has been updated, the /dashboard/invoices path will be revalidated (cache will be deleted), and fresh data will be fetched from the server (a new request will be send).
  revalidatePath("/dashboard/customers");
  return;
}

interface UploadResult {
  url: string;
}

async function saveFile(file: File) {
  // Saving file to cloudinary cloud and return the url - it is necessary to define the images domain is next.config.js file
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  const result = await new Promise<UploadResult>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({}, function (error, result) {
        if (error || result === undefined) {
          reject(error || new Error("Upload result is undefined."));
          return;
        }
        resolve(result);
      })
      .end(buffer);
  });

  return result.url;
}
