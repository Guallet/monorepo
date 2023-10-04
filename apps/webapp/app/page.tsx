import Link from "next/link";
import styles from "./page.module.css";
import { Button } from "@mantine/core";

export default function Home() {
  return (
    <main className={styles.main}>
      <Link href={"google.com"}>This is a sample button</Link>
    </main>
  );
}
