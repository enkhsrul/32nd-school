import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("is_published", true)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Notification error:", error);
      setNotifications([]);
    } else {
      setNotifications(data || []);
    }

    setLoading(false);
  }

  function getTypeName(type) {
    if (type === "announcement") return "Зарлал";
    if (type === "guideline") return "Удирдамж";
    if (type === "competition") return "Тэмцээн";
    if (type === "event") return "Арга хэмжээ";
    if (type === "important") return "Чухал";
    if (type === "achievement") return "Амжилт";

    return "Мэдэгдэл";
  }

  function getIcon(type) {
    if (type === "announcement") return "📢";
    if (type === "guideline") return "📋";
    if (type === "competition") return "🏆";
    if (type === "event") return "📅";
    if (type === "important") return "⚠️";
    if (type === "achievement") return "🎉";

    return "🔔";
  }

  if (loading) {
    return (
      <div>
        <div className="page-head">
          <div>
            <h1>Мэдэгдэл</h1>
            <p className="muted">
              Сургуулийн мэдээлэл
            </p>
          </div>
        </div>

        <section className="card">
          <p className="muted">
            Мэдэгдлүүдийг ачаалж байна...
          </p>
        </section>
      </div>
    );
  }

  if (selected) {
    return (
      <div>
        <div className="page-head">
          <div>
            <button
              onClick={() => setSelected(null)}
              style={{
                border: "none",
                background: "#f1f5f9",
                padding: "9px 15px",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "14px",
              }}
            >
              ← Буцах
            </button>

            <h1>{selected.title}</h1>

            <p className="muted">
              {getTypeName(selected.type)} •{" "}
              {new Date(
                selected.created_at
              ).toLocaleDateString("mn-MN")}
            </p>
          </div>
        </div>

        <section className="card">
          {selected.image_url && (
            <img
              src={selected.image_url}
              alt={selected.title}
              style={{
                width: "100%",
                maxHeight: "400px",
                objectFit: "cover",
                borderRadius: "12px",
                marginBottom: "20px",
              }}
            />
          )}

          <div
            style={{
              fontSize: "14px",
              lineHeight: "1.8",
              whiteSpace: "pre-wrap",
            }}
          >
            {selected.content}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Мэдэгдэл</h1>

          <p className="muted">
            Сургуулийн зарлал, удирдамж,
            тэмцээн уралдаан болон бусад мэдээлэл
          </p>
        </div>
      </div>

      <section className="card">
        {notifications.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "50px 20px",
            }}
          >
            <div
              style={{
                fontSize: "42px",
                marginBottom: "15px",
              }}
            >
              🔔
            </div>

            <h3>
              Одоогоор мэдэгдэл алга
            </h3>

            <p className="muted">
              Сургуулийн шинэ мэдээлэл энд
              харагдана.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {notifications.map(
              (notification) => (
                <button
                  key={notification.id}
                  onClick={() =>
                    setSelected(notification)
                  }
                  style={{
                    width: "100%",
                    background: "#fff",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "18px",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    gap: "15px",
                    alignItems:
                      "flex-start",
                    transition:
                      "0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "#f8fafc";
                    e.currentTarget.style.borderColor =
                      "#bfdbfe";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "#fff";
                    e.currentTarget.style.borderColor =
                      "#e2e8f0";
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      minWidth: "44px",
                      borderRadius:
                        "10px",
                      background:
                        "#eff6ff",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      fontSize: "21px",
                    }}
                  >
                    {getIcon(
                      notification.type
                    )}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        gap: "10px",
                        marginBottom:
                          "5px",
                      }}
                    >
                      <strong
                        style={{
                          color:
                            "#172033",
                          fontSize:
                            "15px",
                        }}
                      >
                        {notification.title}
                      </strong>

                      <span
                        style={{
                          color:
                            "#94a3b8",
                          fontSize:
                            "12px",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {new Date(
                          notification.created_at
                        ).toLocaleDateString(
                          "mn-MN"
                        )}
                      </span>
                    </div>

                    <div
                      style={{
                        color:
                          "#2563eb",
                        fontSize:
                          "12px",
                        marginBottom:
                          "7px",
                        fontWeight:
                          "600",
                      }}
                    >
                      {getTypeName(
                        notification.type
                      )}
                    </div>

                    <p
                      style={{
                        color:
                          "#64748b",
                        fontSize:
                          "13px",
                        margin: 0,
                        lineHeight:
                          "1.5",
                      }}
                    >
                      {notification.content
                        .length > 120
                        ? notification.content.slice(
                            0,
                            120
                          ) + "..."
                        : notification.content}
                    </p>
                  </div>

                  <span
                    style={{
                      color:
                        "#94a3b8",
                      fontSize:
                        "20px",
                    }}
                  >
                    →
                  </span>
                </button>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}