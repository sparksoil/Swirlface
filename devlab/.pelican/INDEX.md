 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a//dev/null b/.pelican/INDEX.md
index 0000000000000000000000000000000000000000..adc6e657b15ed183e89ae16e2437bfec379127e6 100644
--- a//dev/null
+++ b/.pelican/INDEX.md
@@ -0,0 +1,7 @@
+# Swirl Index
+
+- Story Bits (Kitty & Coffee) → _pending_
+- Tech (RV Helper) → _pending_
+- Health Logs → _pending_
+
+> “Jehovah is near to all those calling on him.” — Psalm 145:18
 
EOF
)
