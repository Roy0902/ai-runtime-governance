package local.governance.config;

import java.io.IOException;
import java.io.Reader;
import java.io.Writer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Test-only fault flags. Backed by a file so the web process and the separate
 * arg-admin process see the same state. Never enabled in production.
 */
@Component
public class TestFaults {

    private final Path file;

    public TestFaults(@Value("${governance.test-faults-file:.local-cache/test-faults.properties}") String file) {
        this.file = Path.of(file);
    }

    public boolean enabled(String name) {
        Properties properties = read();
        return Boolean.parseBoolean(properties.getProperty(name, "false"));
    }

    public synchronized void set(String name, boolean enabled) {
        Properties properties = read();
        properties.setProperty(name, Boolean.toString(enabled));
        write(properties);
    }

    public synchronized void clear() {
        write(new Properties());
    }

    private Properties read() {
        Properties properties = new Properties();
        if (!Files.exists(file)) {
            return properties;
        }
        try (Reader reader = Files.newBufferedReader(file)) {
            properties.load(reader);
        } catch (IOException exception) {
            // A missing/unreadable test file means no faults; do not hide a prod path.
        }
        return properties;
    }

    private void write(Properties properties) {
        try {
            Path parent = file.toAbsolutePath().getParent();
            if (parent != null) {
                Files.createDirectories(parent);
            }
            try (Writer writer = Files.newBufferedWriter(file)) {
                properties.store(writer, "test-only fault flags");
            }
        } catch (IOException exception) {
            throw new IllegalStateException("cannot persist test faults", exception);
        }
    }
}
